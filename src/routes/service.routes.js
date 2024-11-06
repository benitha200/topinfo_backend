import { Router } from 'express';
import { serviceController } from '../controllers/service.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', authenticate, authorize('SERVICE_PROVIDER'), serviceController.createService);
router.put('/:id', authenticate, authorize('SERVICE_PROVIDER'), serviceController.updateService);

export default router;