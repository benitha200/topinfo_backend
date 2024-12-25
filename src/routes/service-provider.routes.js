import { Router } from 'express';
import { serviceProviderController } from '../controllers/service-provider.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', serviceProviderController.createServiceProvider);

router.get('/', authenticate, authorize('ADMIN'), serviceProviderController.getAllServiceProviders);

router.get('/:id', authenticate, serviceProviderController.getServiceProviderById);

router.put('/:id', authenticate, serviceProviderController.updateServiceProvider);

router.delete('/:id', authenticate, serviceProviderController.deleteServiceProvider);

router.get('/added-by-me/:id', authenticate, serviceProviderController.getServiceProvidersAddedByUser);

router.post('/approve/:id', authenticate, serviceProviderController.approveServiceProvider);

export default router;
