import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

function secret(name: string, developmentFallback: string): string {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) {
    throw new Error(`${name} must be configured in production.`);
  }
  return developmentFallback;
}

export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: secret('JWT_SECRET', 'synapse_job_portal_super_secret_jwt_key_2026!'),
  DATABASE_PATH:
    process.env.DATABASE_PATH ||
    (process.env.VERCEL === '1' ? '/tmp/database.sqlite' : './data/database.sqlite'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // SMTP – SERVER-ONLY secrets, never sent to frontend
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true', // true = SSL port 465
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'Project Content AI Marketplace',

  // OTP security settings (configurable via env)
  OTP_EXPIRY_SECONDS: parseInt(process.env.OTP_EXPIRY_SECONDS || '300', 10),         // 5 min default
  OTP_RESEND_COOLDOWN_SECONDS: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10), // 60 s
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10),               // 5 max tries
  OTP_MAX_REQUESTS_PER_HOUR: parseInt(process.env.OTP_MAX_REQUESTS_PER_HOUR || '10', 10),

  // Admin SMTP test recipient
  ADMIN_SMTP_TEST_EMAIL: process.env.ADMIN_SMTP_TEST_EMAIL || '',
  ADMIN_API_KEY: secret('ADMIN_API_KEY', 'change_this_admin_key_in_production'),

  // Auth session
  AUTH_SESSION_SECRET: secret('AUTH_SESSION_SECRET', 'synapse_session_secret_2026!'),

  // AI Studio provider configuration (server-side only)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
};
