import { Router } from 'express';
import { requestController } from '../controllers/request.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', requestController.createRequest);
router.get('/', authenticate, requestController.getAllRequests);
router.get('/:id', authenticate, requestController.getRequestById);
router.put('/:id', authenticate, requestController.updateRequest);
router.delete('/:id', authenticate, requestController.deleteRequest);
router.post('/:id/assign-agent', authenticate, authorize('AGENT'), requestController.assignAgent);
router.post('/:id/change-status', authenticate, requestController.changeRequestStatus);

export default router;