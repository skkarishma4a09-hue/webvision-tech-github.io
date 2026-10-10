import { Router } from 'express';
import { createAlert, getAlerts, updateAlert, deleteAlert } from '../controllers/alertController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

export default router;
