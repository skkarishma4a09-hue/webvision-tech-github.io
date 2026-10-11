import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// ─── Session Management ────────────────────────────────────────
router.get('/me', authenticateToken, AuthController.getCurrentUser);
router.post('/logout', AuthController.logout);

// ─── Password authentication ──────────────────────────────────
router.post('/register', authRateLimiter, AuthController.register);
router.post('/login', authRateLimiter, AuthController.login);
router.post('/google', authRateLimiter, AuthController.googleLogin);

export default router;
