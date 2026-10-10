import { Router } from 'express';
import authRoutes from './authRoutes';
import profileRoutes from './profileRoutes';
import jobRoutes from './jobRoutes';
import savedJobRoutes from './savedJobRoutes';
import applicationRoutes from './applicationRoutes';
import alertRoutes from './alertRoutes';
import adminRoutes from './adminRoutes';
import marketplaceRoutes from './marketplaceRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/jobs', jobRoutes);
router.use('/saved-jobs', savedJobRoutes);
router.use('/applications', applicationRoutes);
router.use('/alerts', alertRoutes);
router.use('/admin', adminRoutes);
router.use(marketplaceRoutes);

export default router;
