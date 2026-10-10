import { Router } from 'express';
import { saveJob, unsaveJob, getSavedJobs } from '../controllers/savedJobController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getSavedJobs);
router.post('/', saveJob);
router.delete('/:jobId', unsaveJob);

export default router;
