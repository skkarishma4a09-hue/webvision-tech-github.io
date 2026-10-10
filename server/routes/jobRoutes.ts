import { Router } from 'express';
import { getJobs, getJobById, createJob, updateJob, deleteJob } from '../controllers/jobController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateJobInput } from '../middleware/validate';

const router = Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', authenticateToken, requireAdmin, validateJobInput, createJob);
router.put('/:id', authenticateToken, requireAdmin, updateJob);
router.delete('/:id', authenticateToken, requireAdmin, deleteJob);

export default router;
