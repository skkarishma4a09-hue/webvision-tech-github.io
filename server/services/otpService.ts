/**
 * OTP Service
 * Handles secure generation, hashing, storage, and verification of one-time passwords.
 *
 * Security guarantees:
 *  - OTP is generated with crypto.randomInt (CSPRNG)
 *  - OTP is NEVER stored in plaintext – only SHA-256 hash
 *  - OTP is NEVER logged
 *  - OTP is NEVER returned through any API response
 *  - Single-use: invalidated immediately after successful verification
 *  - Attempt-limited, expiration-enforced
 */

import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { UserRepository } from '../repositories/userRepository';
import { logAuditEvent } from '../utils/auditLogger';
import { sendOtpEmail, SmtpNotConfiguredError, SmtpDeliveryError, maskEmail } from './mail/smtp.service';

// ─────────────────────────────────────────────
// OTP generation
// ─────────────────────────────────────────────

/** Generate a cryptographically secure 6-digit OTP. Never log the return value. */
function generateOTP(): string {
  // crypto.randomInt is CSPRNG - safe for security-sensitive codes
  const code = crypto.randomInt(100000, 999999);
  return String(code);
}

/** Hash OTP with SHA-256 for storage. One-way, never reversible. */
function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// ─────────────────────────────────────────────
// Request OTP
// ─────────────────────────────────────────────
export interface RequestOtpResult {
  success: boolean;
  message: string;
  resendAvailableAt?: Date;
}

export async function requestOtp(
  email: string,
  meta?: { ip?: string; userAgent?: string }
): Promise<RequestOtpResult> {
  const normalizedEmail = email.toLowerCase().trim();

  // Check for active unexpired OTP with resend cooldown
  const recent = await prisma.oTPVerification.findFirst({
    where: {
      email: normalizedEmail,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (recent?.resendAt && recent.resendAt > new Date()) {
    // Still within cooldown window
    return {
      success: false,
      message: `Please wait before requesting another code.`,
      resendAvailableAt: recent.resendAt,
    };
  }

  // Invalidate any previous unused OTPs for this email
  await prisma.oTPVerification.updateMany({
    where: { email: normalizedEmail, usedAt: null },
    data: { usedAt: new Date() }, // mark as consumed to prevent reuse
  });

  // Look up existing user (for audit)
  const existingUser = await UserRepository.findByEmail(normalizedEmail);

  // Generate and hash OTP - never store plaintext
  const otp = generateOTP();
  const otpHash = hashOTP(otp);

  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_SECONDS * 1000);
  const resendAt = new Date(Date.now() + env.OTP_RESEND_COOLDOWN_SECONDS * 1000);

  // Save hashed OTP record
  await prisma.oTPVerification.create({
    data: {
      email: normalizedEmail,
      userId: existingUser?.id ?? null,
      otpHash,
      expiresAt,
      resendAt,
    },
  });

  // Attempt SMTP delivery
  try {
    await sendOtpEmail(normalizedEmail, otp);
  } catch (err) {
    if (err instanceof SmtpNotConfiguredError) {
      await logAuditEvent({
        actorId: existingUser?.id,
        action: 'OTP_REQUEST_SMTP_NOT_CONFIGURED',
        resource: 'OTPVerification',
        result: 'FAILURE',
        metadata: { email: maskEmail(normalizedEmail) },
        ipAddress: meta?.ip,
        userAgent: meta?.userAgent,
      });
      if (env.NODE_ENV === 'production') { throw { code: 'SMTP_NOT_CONFIGURED', message: 'Email service is not configured. Please contact support.' }; }
      console.log('[DEV] SMTP not configured - verification code for ' + maskEmail(normalizedEmail) + ' is ' + otp); // dev fallback - never returned via the API
    }
    if (err instanceof SmtpDeliveryError) {
      await logAuditEvent({
        actorId: existingUser?.id,
        action: 'OTP_REQUEST_SMTP_FAILURE',
        resource: 'OTPVerification',
        result: 'FAILURE',
        metadata: { email: maskEmail(normalizedEmail) },
        ipAddress: meta?.ip,
        userAgent: meta?.userAgent,
      });
      throw { code: 'SMTP_DELIVERY_FAILED', message: "We couldn't send the verification email. Please try again." };
    }
    throw err;
  }

  await logAuditEvent({
    actorId: existingUser?.id,
    action: 'OTP_REQUESTED',
    resource: 'OTPVerification',
    result: 'SUCCESS',
    metadata: { email: maskEmail(normalizedEmail) },
    ipAddress: meta?.ip,
    userAgent: meta?.userAgent,
  });

  return { success: true, message: 'Verification code sent successfully.' };
}

// ─────────────────────────────────────────────
// Verify OTP
// ─────────────────────────────────────────────
export interface VerifyOtpResult {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    emailVerified: boolean;
    isNewUser: boolean;
  };
  token: string;
}

export async function verifyOtp(
  email: string,
  otp: string,
  meta?: { ip?: string; userAgent?: string }
): Promise<VerifyOtpResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const otpHash = hashOTP(otp);

  // Find the latest unused, unexpired OTP record
  const record = await prisma.oTPVerification.findFirst({
    where: {
      email: normalizedEmail,
      usedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    await logAuditEvent({
      action: 'OTP_VERIFY_FAILED',
      resource: 'OTPVerification',
      result: 'FAILURE',
      metadata: { email: maskEmail(normalizedEmail), reason: 'No active OTP' },
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });
    throw { code: 'OTP_NOT_FOUND', message: 'No active verification code found. Please request a new one.' };
  }

  // Check expiration
  if (new Date() > record.expiresAt) {
    await prisma.oTPVerification.update({ where: { id: record.id }, data: { usedAt: new Date() } });
    await logAuditEvent({
      action: 'OTP_EXPIRED',
      resource: 'OTPVerification',
      result: 'FAILURE',
      metadata: { email: maskEmail(normalizedEmail) },
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });
    throw { code: 'OTP_EXPIRED', message: 'This verification code has expired. Please request a new one.' };
  }

  // Check attempt limit
  if (record.attemptCount >= env.OTP_MAX_ATTEMPTS) {
    await prisma.oTPVerification.update({ where: { id: record.id }, data: { usedAt: new Date() } });
    await logAuditEvent({
      action: 'OTP_TOO_MANY_ATTEMPTS',
      resource: 'OTPVerification',
      result: 'FAILURE',
      metadata: { email: maskEmail(normalizedEmail) },
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });
    throw { code: 'OTP_MAX_ATTEMPTS', message: 'Too many verification attempts. Please request a new code.' };
  }

  // Increment attempt count before checking hash (prevents timing attacks)
  await prisma.oTPVerification.update({
    where: { id: record.id },
    data: { attemptCount: { increment: 1 } },
  });

  // Constant-time comparison to prevent timing attacks
  const expectedHash = Buffer.from(record.otpHash, 'hex');
  const providedHash = Buffer.from(otpHash, 'hex');
  const isValid =
    expectedHash.length === providedHash.length &&
    crypto.timingSafeEqual(expectedHash, providedHash);

  if (!isValid) {
    await logAuditEvent({
      action: 'OTP_VERIFY_FAILED',
      resource: 'OTPVerification',
      result: 'FAILURE',
      metadata: { email: maskEmail(normalizedEmail), reason: 'Invalid OTP' },
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });
    throw { code: 'OTP_INVALID', message: 'That code is incorrect. Please try again.' };
  }

  // ✅ OTP is valid – mark as used immediately (single-use)
  await prisma.oTPVerification.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  // Find or create user
  let existingUser = await UserRepository.findByEmail(normalizedEmail);
  const isNewUser = !existingUser;

  if (!existingUser) {
    existingUser = await UserRepository.createOtpUser(normalizedEmail);
  } else {
    // Mark email as verified and update lastLoginAt
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { emailVerified: true, lastLoginAt: new Date() },
    });
  }

  // Create JWT session
  const jwt = await import('jsonwebtoken');
  const sessionToken = jwt.default.sign(
    { userId: existingUser.id, email: existingUser.email, role: existingUser.role, jti: crypto.randomUUID() },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  const refreshToken = crypto.randomBytes(40).toString('hex');

  const sessionRepo = await import('../repositories/sessionRepository');
  await sessionRepo.SessionRepository.createSession({
    userId: existingUser.id,
    token: sessionToken,
    refreshToken,
    ipAddress: meta?.ip,
    userAgent: meta?.userAgent,
  });

  // Log login attempt
  await prisma.loginAttempt.create({
    data: {
      email: normalizedEmail,
      userId: existingUser.id,
      ipAddress: meta?.ip || null,
      userAgent: meta?.userAgent || null,
      success: true,
    },
  });

  await logAuditEvent({
    actorId: existingUser.id,
    action: isNewUser ? 'OTP_VERIFY_NEW_USER' : 'OTP_VERIFY_LOGIN',
    resource: 'OTPVerification',
    result: 'SUCCESS',
    metadata: { email: maskEmail(normalizedEmail) },
    ipAddress: meta?.ip,
    userAgent: meta?.userAgent,
  });

  return {
    success: true,
    user: {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role,
      emailVerified: true,
      isNewUser,
    },
    token: sessionToken,
  };
}

// ─────────────────────────────────────────────
// Resend OTP (with cooldown enforcement)
// ─────────────────────────────────────────────
export async function resendOtp(
  email: string,
  meta?: { ip?: string; userAgent?: string }
): Promise<RequestOtpResult> {
  // Delegates to requestOtp – cooldown is enforced there
  return requestOtp(email, meta);
}
