import { Router } from 'express';
import { AdminController, requireAdminKey } from '../controllers/adminController';

const router = Router();

// All admin routes protected by API key
router.use(requireAdminKey);

router.get('/smtp/status', AdminController.smtpStatus);
router.post('/smtp/test', AdminController.smtpTest);

export default router;
