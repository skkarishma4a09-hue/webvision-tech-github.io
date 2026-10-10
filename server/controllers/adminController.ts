import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import {
  getSmtpStatusInfo,
  testSmtpConnection,
  sendSmtpTestEmail,
  isSmtpConfigured,
} from '../services/mail/smtp.service';
import { env } from '../config/env';
import { z } from 'zod';

/**
 * Admin SMTP Diagnostic Controller
 * All endpoints MUST be protected by requireAdminKey middleware.
 * NEVER return SMTP password or raw credentials.
 */
export class AdminController {
  /**
   * GET /api/admin/smtp/status
   * Returns safe SMTP configuration info – no credentials.
   */
  static async smtpStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const info = getSmtpStatusInfo();
      return sendSuccess(res, {
        smtp: info,
        otpConfig: {
          expirySeconds: env.OTP_EXPIRY_SECONDS,
          resendCooldownSeconds: env.OTP_RESEND_COOLDOWN_SECONDS,
          maxAttempts: env.OTP_MAX_ATTEMPTS,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/admin/smtp/test
   * Verify SMTP connection and optionally send a test email.
   */
  static async smtpTest(req: Request, res: Response, next: NextFunction) {
    try {
      const connectionResult = await testSmtpConnection();

      if (!connectionResult.success) {
        return sendError(res, 'SMTP_TEST_FAILED', connectionResult.message, 503);
      }

      // Optionally send test email if recipient configured
      let emailSent = false;
      let emailRecipient: string | null = null;

      const testEmail = env.ADMIN_SMTP_TEST_EMAIL;
      if (testEmail) {
        try {
          await sendSmtpTestEmail(testEmail);
          emailSent = true;
          emailRecipient = testEmail;
        } catch (err: any) {
          return sendSuccess(res, {
            connection: connectionResult,
            emailSent: false,
            error: 'Connection verified but test email delivery failed. Check server logs.',
          });
        }
      }

      return sendSuccess(res, {
        connection: connectionResult,
        emailSent,
        emailRecipient,
      });
    } catch (err) {
      next(err);
    }
  }
}

// ─────────────────────────────────────────────
// Admin API key middleware
// Protects admin endpoints with a simple API key check.
// In production, use proper RBAC via authenticateToken + requireRole('ADMIN').
// ─────────────────────────────────────────────
export function requireAdminKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-admin-api-key'] as string;
  if (!key || key !== env.ADMIN_API_KEY) {
    return sendError(res, 'UNAUTHORIZED', 'Admin access required.', 401);
  }
  next();
}
