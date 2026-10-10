import crypto from 'crypto';
import { prisma } from '../config/prisma';
export const TokenType = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const;
export type TokenType = keyof typeof TokenType;

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createVerificationToken(userId: string, type: TokenType, expiresInHours = 24) {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  // Invalidate old pending tokens of this type for the user
  await prisma.verificationToken.updateMany({
    where: { userId, type, usedAt: null },
    data: { usedAt: new Date() },
  });

  const record = await prisma.verificationToken.create({
    data: {
      userId,
      token,
      type,
      expiresAt,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV MODE TOKEN]: Generated ${type} token for user ${userId}: ${token}`);
  }

  return record;
}

export async function verifyToken(token: string, type: TokenType) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.type !== type) {
    return { valid: false, message: 'Invalid or missing token.' };
  }

  if (record.usedAt) {
    return { valid: false, message: 'Token has already been used.' };
  }

  if (new Date() > record.expiresAt) {
    return { valid: false, message: 'Token has expired.' };
  }

  return { valid: true, record };
}
