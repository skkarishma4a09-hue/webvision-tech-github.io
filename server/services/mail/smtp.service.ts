/**
 * SMTP Mail Service
 * Handles all email delivery for Project Content AI Marketplace.
 * SMTP credentials are server-only and never exposed to the frontend.
 */

import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { getOtpEmailHtml, getOtpEmailText } from './otp-email.template';

// ─────────────────────────────────────────────
// SMTP configuration status
// ─────────────────────────────────────────────
export function isSmtpConfigured(): boolean {
  return Boolean(
    env.SMTP_HOST &&
    env.SMTP_USER &&
    env.SMTP_PASSWORD &&
    env.SMTP_FROM
  );
}

// ─────────────────────────────────────────────
// Build transporter (lazy, per-call to support env hot-reload in dev)
// ─────────────────────────────────────────────
function createTransporter() {
  if (!isSmtpConfigured()) {
    throw new SmtpNotConfiguredError();
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    // Never expose credentials in logs
    logger: false,
    debug: false,
    connectionTimeout: 10_000,
    greetingTimeout: 8_000,
    socketTimeout: 15_000,
    // In development, allow self‑signed certificates; in production we require valid TLS.
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
}

// ─────────────────────────────────────────────
// Custom error classes
// ─────────────────────────────────────────────
export class SmtpNotConfiguredError extends Error {
  constructor() {
    super('SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD and SMTP_FROM in environment variables.');
    this.name = 'SmtpNotConfiguredError';
  }
}

export class SmtpDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SmtpDeliveryError';
  }
}

// ─────────────────────────────────────────────
// Send OTP verification email
// ─────────────────────────────────────────────
export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const transporter = createTransporter();
  const expiryMinutes = Math.ceil(env.OTP_EXPIRY_SECONDS / 60);

  const mailOptions = {
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM}>`,
    to,
    subject: 'Your Project Content AI Marketplace verification code',
    html: getOtpEmailHtml(otp, expiryMinutes),
    text: getOtpEmailText(otp, expiryMinutes),
  };

  try {
    await transporter.sendMail(mailOptions);
    // Log delivery success (no OTP in log)
    console.log(`[SMTP] OTP email delivered to ${maskEmail(to)}`);
  } catch (err: any) {
    // Log technical details server-side only
    console.error('[SMTP] Delivery failure:', err?.message || err);
    throw new SmtpDeliveryError('Failed to deliver verification email. Please try again.');
  } finally {
    transporter.close();
  }
}

// ─────────────────────────────────────────────
// Test SMTP connection (admin only)
// ─────────────────────────────────────────────
export async function testSmtpConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    transporter.close();
    return { success: true, message: 'SMTP connection verified successfully.' };
  } catch (err: any) {
    if (err instanceof SmtpNotConfiguredError) {
      return { success: false, message: err.message };
    }
    // Safe, non-credential message
    return { success: false, message: 'SMTP connection failed. Check server logs for details.' };
  }
}

// ─────────────────────────────────────────────
// Send SMTP test email (admin only)
// ─────────────────────────────────────────────
export async function sendSmtpTestEmail(to: string): Promise<void> {
  const transporter = createTransporter();
  try {
    await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM}>`,
      to,
      subject: '[Test] Project Content AI Marketplace SMTP Diagnostic',
      text: `SMTP test email from Project Content AI Marketplace.\n\nTimestamp: ${new Date().toISOString()}\nHost: ${env.SMTP_HOST}:${env.SMTP_PORT}\n\nThis is a diagnostic email – no action required.`,
      html: `<p><strong>SMTP Diagnostic Test</strong></p><p>Project Content AI Marketplace SMTP is working correctly.</p><p><small>Sent: ${new Date().toISOString()}</small></p>`,
    });
  } finally {
    transporter.close();
  }
}

// ─────────────────────────────────────────────
// Safe SMTP status info (no credentials)
// ─────────────────────────────────────────────
export function getSmtpStatusInfo() {
  return {
    configured: isSmtpConfigured(),
    host: env.SMTP_HOST || null,
    port: env.SMTP_PORT || null,
    secure: env.SMTP_SECURE,
    from: env.SMTP_FROM || null,
    fromName: env.SMTP_FROM_NAME || null,
    // Never include: SMTP_PASSWORD, SMTP_USER (credentials)
  };
}

// ─────────────────────────────────────────────
// Utility: mask email for logs
// ─────────────────────────────────────────────
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const masked = local.length > 2
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : local[0] + '*';
  return `${masked}@${domain}`;
}
