import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { OTPController } from '../controllers/otpController';
import { authenticateToken } from '../middleware/auth';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// ─── OTP Authentication (primary flow) ────────────────────────
router.post('/request-otp', otpRateLimiter, OTPController.requestOtp);
router.post('/verify-otp', otpRateLimiter, OTPController.verifyOtp);
router.post('/resend-otp', otpRateLimiter, OTPController.resendOtp);

// ─── Session Management ────────────────────────────────────────
router.get('/me', authenticateToken, AuthController.getCurrentUser);
router.post('/logout', AuthController.logout);

// ─── Legacy password-based auth (kept for compatibility) ───────
router.post('/register', authRateLimiter, AuthController.register);
router.post('/login', authRateLimiter, AuthController.login);

export default router;
