import { prisma } from '../config/prisma';

export class SessionRepository {
  static async createSession({
    userId,
    token,
    refreshToken,
    ipAddress,
    userAgent,
    device,
    browser,
    expiresInDays = 7,
  }: {
    userId: string;
    token: string;
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    browser?: string;
    expiresInDays?: number;
  }) {
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    return prisma.session.create({
      data: {
        userId,
        token,
        refreshToken,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        device: device || 'Web Browser',
        browser: browser || 'Unknown Browser',
        expiresAt,
      },
    });
  }

  static async revokeSession(token: string) {
    return prisma.session.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  }

  static async revokeAllUserSessions(userId: string) {
    return prisma.session.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }
}
