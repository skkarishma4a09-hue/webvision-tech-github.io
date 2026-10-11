import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { UserRepository } from '../repositories/userRepository';
import { SessionRepository } from '../repositories/sessionRepository';
import { hashPassword, verifyPassword } from '../utils/password';
import { logAuditEvent } from '../utils/auditLogger';
import { createVerificationToken, verifyToken, TokenType } from '../utils/email';
import { OAuth2Client } from 'google-auth-library';

const googleOAuthClient = new OAuth2Client();

export class AuthService {
  static async register(data: { name: string; email: string; password: string }, meta?: { ip?: string; userAgent?: string }) {
    const email = data.email.toLowerCase().trim();
    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      await logAuditEvent({ action: 'REGISTER_FAILED', resource: 'User', result: 'FAILURE', metadata: { reason: 'Duplicate' }, ipAddress: meta?.ip, userAgent: meta?.userAgent });
      throw { code: 'DUPLICATE_ACCOUNT', message: 'An account with this email address already exists.' };
    }

    const hashedPassword = await hashPassword(data.password);
    let user;
    try {
      user = await UserRepository.create({
        name: data.name.trim(),
        email,
        password: hashedPassword,
        role: 'USER',
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw { code: 'DUPLICATE_ACCOUNT', message: 'An account with this email address already exists.' };
      }
      throw error;
    }

    // Create active session
    const accessToken = jwt.sign({ userId: user.id, email: user.email, role: user.role, jti: crypto.randomUUID() }, env.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = crypto.randomBytes(40).toString('hex');

    await SessionRepository.createSession({
      userId: user.id,
      token: accessToken,
      refreshToken,
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });

    await logAuditEvent({ actorId: user.id, action: 'REGISTER', resource: 'User', result: 'SUCCESS', ipAddress: meta?.ip, userAgent: meta?.userAgent });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        profile: user.profile,
      },
      token: accessToken,
    };
  }

  static async login(data: { email: string; password: string }, meta?: { ip?: string; userAgent?: string }) {
    const user = await UserRepository.findByEmail(data.email.toLowerCase().trim());

    if (!user) {
      await logAuditEvent({ action: 'LOGIN_FAILED', resource: 'User', result: 'FAILURE', metadata: { email: data.email, reason: 'Invalid Email' }, ipAddress: meta?.ip, userAgent: meta?.userAgent });
      throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email address or password.' };
    }

    if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
      await logAuditEvent({ actorId: user.id, action: 'LOGIN_BLOCKED', resource: 'User', result: 'FAILURE', metadata: { reason: 'Account Locked' }, ipAddress: meta?.ip, userAgent: meta?.userAgent });
      throw { code: 'ACCOUNT_LOCKED', message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.' };
    }

    const isMatch = user.password
      ? await verifyPassword(data.password, user.password)
      : false;
    if (!isMatch) {
      await UserRepository.recordFailedLogin(user.id, user.failedLoginAttempts);
      await logAuditEvent({ actorId: user.id, action: 'LOGIN_FAILED', resource: 'User', result: 'FAILURE', metadata: { reason: 'Invalid Password' }, ipAddress: meta?.ip, userAgent: meta?.userAgent });
      throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email address or password.' };
    }

    if (user.failedLoginAttempts > 0) {
      await UserRepository.resetFailedLogin(user.id);
    }

    const accessToken = jwt.sign({ userId: user.id, email: user.email, role: user.role, jti: crypto.randomUUID() }, env.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = crypto.randomBytes(40).toString('hex');

    await SessionRepository.createSession({
      userId: user.id,
      token: accessToken,
      refreshToken,
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });

    await logAuditEvent({ actorId: user.id, action: 'LOGIN', resource: 'User', result: 'SUCCESS', ipAddress: meta?.ip, userAgent: meta?.userAgent });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        profile: user.profile,
      },
      token: accessToken,
    };
  }

  static async loginWithGoogle(credential: string, meta?: { ip?: string; userAgent?: string }) {
    if (!env.GOOGLE_CLIENT_ID) {
      throw { code: 'GOOGLE_NOT_CONFIGURED', message: 'Google sign-in is not configured.' };
    }

    let payload;
    try {
      const ticket = await googleOAuthClient.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw { code: 'INVALID_GOOGLE_CREDENTIAL', message: 'Google sign-in could not be verified. Please try again.' };
    }

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw { code: 'INVALID_GOOGLE_CREDENTIAL', message: 'Google sign-in requires a verified Google email.' };
    }

    const email = payload.email.toLowerCase().trim();
    let user = await UserRepository.findByEmail(email);
    if (!user) {
      try {
        user = await UserRepository.create({
          name: payload.name?.trim() || email.split('@')[0],
          email,
          emailVerified: true,
        });
      } catch (error) {
        if (!(error && typeof error === 'object' && 'code' in error && error.code === 'P2002')) {
          throw error;
        }
        user = await UserRepository.findByEmail(email);
        if (!user) throw error;
      }
    }

    if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
      throw { code: 'ACCOUNT_LOCKED', message: 'Account is temporarily locked. Please try again later.' };
    }

    if (!user.emailVerified) {
      await UserRepository.markEmailVerified(user.id);
      user = await UserRepository.findByEmail(email) ?? user;
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, jti: crypto.randomUUID() },
      env.JWT_SECRET,
      { expiresIn: '7d' },
    );
    const refreshToken = crypto.randomBytes(40).toString('hex');

    await SessionRepository.createSession({
      userId: user.id,
      token: accessToken,
      refreshToken,
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });
    await logAuditEvent({
      actorId: user.id,
      action: 'GOOGLE_LOGIN',
      resource: 'User',
      result: 'SUCCESS',
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        profile: user.profile,
      },
      token: accessToken,
    };
  }

  static async logout(token: string, userId?: string, allSessions = false, meta?: { ip?: string; userAgent?: string }) {
    if (allSessions && userId) {
      await SessionRepository.revokeAllUserSessions(userId);
    } else {
      await SessionRepository.revokeSession(token);
    }
    await logAuditEvent({ actorId: userId || null, action: allSessions ? 'LOGOUT_ALL' : 'LOGOUT', resource: 'Session', result: 'SUCCESS', ipAddress: meta?.ip, userAgent: meta?.userAgent });
    return { success: true };
  }

  static async forgotPassword(email: string, meta?: { ip?: string; userAgent?: string }) {
    const user = await UserRepository.findByEmail(email);
    // Generic response to prevent account enumeration
    if (!user) {
      return { message: 'If an account exists with this email address, a password reset token has been generated.' };
    }

    const record = await createVerificationToken(user.id, TokenType.PASSWORD_RESET, 2);

    await logAuditEvent({ actorId: user.id, action: 'FORGOT_PASSWORD_REQUEST', resource: 'User', result: 'SUCCESS', ipAddress: meta?.ip, userAgent: meta?.userAgent });

    return {
      message: 'If an account exists with this email address, a password reset token has been generated.',
      resetToken: process.env.NODE_ENV === 'development' ? record.token : undefined,
    };
  }

  static async resetPassword(token: string, newPassword: string, meta?: { ip?: string; userAgent?: string }) {
    const verification = await verifyToken(token, TokenType.PASSWORD_RESET);
    if (!verification.valid || !verification.record) {
      throw { code: 'INVALID_TOKEN', message: verification.message || 'Invalid or expired password reset token.' };
    }

    const newHash = await hashPassword(newPassword);
    await UserRepository.updatePassword(verification.record.userId, newHash);
    await SessionRepository.revokeAllUserSessions(verification.record.userId);

    await logAuditEvent({ actorId: verification.record.userId, action: 'RESET_PASSWORD', resource: 'User', result: 'SUCCESS', ipAddress: meta?.ip, userAgent: meta?.userAgent });

    return { message: 'Password reset successfully. Please log in with your new password.' };
  }

  static async verifyEmailToken(token: string, meta?: { ip?: string; userAgent?: string }) {
    const verification = await verifyToken(token, TokenType.EMAIL_VERIFICATION);
    if (!verification.valid || !verification.record) {
      throw { code: 'INVALID_TOKEN', message: verification.message || 'Invalid or expired email verification token.' };
    }

    await UserRepository.markEmailVerified(verification.record.userId);

    await logAuditEvent({ actorId: verification.record.userId, action: 'VERIFY_EMAIL', resource: 'User', result: 'SUCCESS', ipAddress: meta?.ip, userAgent: meta?.userAgent });

    return { message: 'Email verified successfully!' };
  }
}
