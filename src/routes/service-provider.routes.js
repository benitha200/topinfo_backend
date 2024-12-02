import { Router } from 'express';
import { serviceProviderController } from '../controllers/service-provider.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', serviceProviderController.createServiceProvider);

router.get('/', authenticate, authorize('ADMIN'), serviceProviderController.getAllServiceProviders);

router.get('/:id', authenticate, serviceProviderController.getServiceProviderById);

router.put('/:id', authenticate, authorize('ADMIN'), serviceProviderController.updateServiceProvider);

router.delete('/:id', authenticate, authorize('ADMIN'), serviceProviderController.deleteServiceProvider);

router.post('/approve/:id', authenticate, authorize('ADMIN'), serviceProviderController.approveServiceProvider);

export default router;
