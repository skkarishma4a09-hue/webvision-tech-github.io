import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/authValidator';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid registration parameters', 400, parsed.error.format());
      }

      const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await AuthService.register(parsed.data, meta);

      // Set secure HTTP-only cookie
      res.cookie('accessToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, result, 201, 'Registration successful');
    } catch (err: any) {
      if (err.code) {
        return sendError(res, err.code, err.message, 400);
      }
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid login parameters', 400, parsed.error.format());
      }

      const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await AuthService.login(parsed.data, meta);

      res.cookie('accessToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, result, 200, 'Login successful');
    } catch (err: any) {
      if (err.code) {
        return sendError(res, err.code, err.message, err.code === 'ACCOUNT_LOCKED' ? 403 : 401);
      }
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers['authorization']?.split(' ')[1] || req.cookies?.accessToken;
      const allSessions = req.body?.allSessions === true;
      const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };

      if (token) {
        await AuthService.logout(token, req.authUser?.id, allSessions, meta);
      }

      res.clearCookie('accessToken');
      return sendSuccess(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.authUser) {
        return sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401);
      }
      return sendSuccess(res, { user: req.authUser });
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid email address', 400, parsed.error.format());
      }

      const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await AuthService.forgotPassword(parsed.data.email, meta);
      return sendSuccess(res, result);
    } catch (err: any) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid password reset input', 400, parsed.error.format());
      }

      const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await AuthService.resetPassword(parsed.data.token, parsed.data.newPassword, meta);
      return sendSuccess(res, result);
    } catch (err: any) {
      if (err.code) {
        return sendError(res, err.code, err.message, 400);
      }
      next(err);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token as string || req.body?.token;
      if (!token) {
        return sendError(res, 'MISSING_TOKEN', 'Verification token is required', 400);
      }

      const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await AuthService.verifyEmailToken(token, meta);
      return sendSuccess(res, result);
    } catch (err: any) {
      if (err.code) {
        return sendError(res, err.code, err.message, 400);
      }
      next(err);
    }
  }
}
