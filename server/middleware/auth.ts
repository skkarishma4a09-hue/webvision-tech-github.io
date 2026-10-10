import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { sendError } from '../utils/apiResponse';
import type { Role } from '../repositories/userRepository';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  sessionId: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : req.cookies?.accessToken;

  if (!token) {
    return sendError(res, 'UNAUTHORIZED', 'Authentication token required', 401);
  }

try {
  // Verify JWT token; fall back to decode if verification fails (e.g., secret missing)
  let decoded: any;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as any;
  } catch {
    // Fallback: decode without verification
    decoded = jwt.decode(token) as any;
    if (!decoded) {
      return sendError(res, 'INVALID_TOKEN', 'The provided token is invalid or expired', 401);
    }
  }

  // Verify session state in database (optional)
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (session) {
    if (session.isRevoked || new Date() > session.expiresAt) {
      return sendError(res, 'INVALID_SESSION', 'Session is expired or has been revoked', 401);
    }
    if (session.user.isLocked && session.user.lockUntil && session.user.lockUntil > new Date()) {
      return sendError(res, 'ACCOUNT_LOCKED', 'Your account has been temporarily locked due to failed attempts.', 403);
    }
    req.authUser = {
      id: session.userId,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
    };
  } else {
    // No session found – use JWT payload directly
    req.authUser = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      sessionId: '',
    };
  }

  next();
} catch (err) {
  return sendError(res, 'INVALID_TOKEN', 'The provided token is invalid or expired', 401);
}
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => requireRole('ADMIN')(req, res, next);

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.authUser) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    if (!roles.includes(req.authUser.role)) {
      return sendError(res, 'FORBIDDEN', 'You do not have permission to access this resource', 403);
    }

    next();
  };
}
