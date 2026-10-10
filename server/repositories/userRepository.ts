import { prisma } from '../config/prisma';
export type Role = 'USER' | 'CREATOR' | 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN';

// Helper so string literals work
const Role = {
  USER: 'USER' as Role,
  CREATOR: 'CREATOR' as Role,
  JOB_SEEKER: 'JOB_SEEKER' as Role,
  RECRUITER: 'RECRUITER' as Role,
  ADMIN: 'ADMIN' as Role,
};

export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  /** Create a user via OTP (no password required) */
  static async createOtpUser(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    return prisma.user.create({
      data: {
        email: normalizedEmail,
        password: null,
        role: 'USER',
        emailVerified: true,
        lastLoginAt: new Date(),
        profile: {
          create: {
            name: normalizedEmail.split('@')[0], // default name from email
          },
        },
      },
      include: { profile: true },
    });
  }

  static async create(data: {
    name: string;
    email: string;
    password?: string;
    role?: Role;
  }) {
    const email = data.email.toLowerCase();
    const role = data.role || Role.USER;

    return prisma.user.create({
      data: {
        email,
        password: data.password ?? null,
        name: data.name,
        role,
        profile: {
          create: {
            name: data.name,
            headline: role === 'JOB_SEEKER' ? 'Seeking new opportunities' : 'Hiring Manager',
            about: 'Welcome to my professional profile.',
          },
        },
      },
      include: { profile: true },
    });
  }

  static async updatePassword(userId: string, newPasswordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        password: newPasswordHash,
        failedLoginAttempts: 0,
        isLocked: false,
        lockUntil: null,
      },
    });
  }

  static async recordFailedLogin(userId: string, currentAttempts: number) {
    const attempts = currentAttempts + 1;
    const isLocked = attempts >= 5;
    const lockUntil = isLocked ? new Date(Date.now() + 15 * 60 * 1000) : null;

    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: attempts,
        isLocked,
        lockUntil,
      },
    });
  }

  static async resetFailedLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        isLocked: false,
        lockUntil: null,
      },
    });
  }

  static async markEmailVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, lastLoginAt: new Date() },
    });
  }

  static async updateProfile(userId: string, data: { name?: string; role?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
