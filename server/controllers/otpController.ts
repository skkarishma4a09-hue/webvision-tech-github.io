import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { requestOtp, verifyOtp, resendOtp } from '../services/otpService';
import { z } from 'zod';

// ─────────────────────────────────────────────
// Validation schemas
// ─────────────────────────────────────────────
const emailSchema = z.object({
  email: z.string().email('Invalid email address').max(254),
});

const verifySchema = z.object({
  email: z.string().email('Invalid email address').max(254),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
});

// ─────────────────────────────────────────────
// OTP Controller
// ─────────────────────────────────────────────
export class OTPController {
  /**
   * POST /api/auth/request-otp
   * Accept an email, generate OTP on backend, send via SMTP.
   * Never reveals whether an account already exists.
   */
  static async requestOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = emailSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'VALIDATION_ERROR', 'Please enter a valid email address.', 400);
      }

      const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await requestOtp(parsed.data.email, meta);

      if (!result.success) {
        return sendError(res, 'RESEND_COOLDOWN', result.message, 429, {
          resendAvailableAt: result.resendAvailableAt,
        });
      }

      // Generic success – do NOT reveal whether account exists
      return sendSuccess(res, { success: true, message: 'Verification code sent' });
    } catch (err: any) {
      if (err.code) {
        const statusMap: Record<string, number> = {
          SMTP_NOT_CONFIGURED: 503,
          SMTP_DELIVERY_FAILED: 502,
        };
        return sendError(res, err.code, err.message, statusMap[err.code] || 400);
      }
      next(err);
    }
  }

  /**
   * POST /api/auth/verify-otp
   * Verify the OTP submitted by the user.
   * On success, creates server-side session and sets secure cookie.
   */
  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = verifySchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid request parameters.', 400);
      }

      const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await verifyOtp(parsed.data.email, parsed.data.otp, meta);

      // Set secure HttpOnly cookie
      res.cookie('accessToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess(res, {
        success: true,
        authenticated: true,
        user: result.user,
        // Token also returned for API clients (SPA uses cookie)
        token: result.token,
      });
    } catch (err: any) {
      if (err.code) {
        const statusMap: Record<string, number> = {
          OTP_NOT_FOUND: 400,
          OTP_EXPIRED: 400,
          OTP_INVALID: 401,
          OTP_MAX_ATTEMPTS: 429,
        };
        return sendError(res, err.code, err.message, statusMap[err.code] || 400);
      }
      next(err);
    }
  }

  /**
   * POST /api/auth/resend-otp
   * Resend OTP with cooldown enforcement.
   */
  static async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = emailSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'VALIDATION_ERROR', 'Please enter a valid email address.', 400);
      }

      const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await resendOtp(parsed.data.email, meta);

      if (!result.success) {
        return sendError(res, 'RESEND_COOLDOWN', result.message, 429, {
          resendAvailableAt: result.resendAvailableAt,
        });
      }

      return sendSuccess(res, { success: true, message: 'Verification code resent' });
    } catch (err: any) {
      if (err.code) {
        const statusMap: Record<string, number> = {
          SMTP_NOT_CONFIGURED: 503,
          SMTP_DELIVERY_FAILED: 502,
        };
        return sendError(res, err.code, err.message, statusMap[err.code] || 400);
      }
      next(err);
    }
  }
}
