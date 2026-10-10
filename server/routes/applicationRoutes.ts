import { Router } from 'express';
import { applyToJob, getApplications, updateApplicationStatus } from '../controllers/applicationController';
import { authenticateToken } from '../middleware/auth';
import { validateApplicationStatus } from '../middleware/validate';

const router = Router();

router.use(authenticateToken);

router.get('/', getApplications);
router.post('/', applyToJob);
router.put('/:id/status', validateApplicationStatus, updateApplicationStatus);

export default router;
