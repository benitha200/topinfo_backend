import { Router } from 'express';
import { serviceCategoryController } from '../controllers/service-category.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticate, authorize('ADMIN'), serviceCategoryController.createServiceCategory);
router.get('/', serviceCategoryController.getAllServiceCategories);
router.get('/:id', serviceCategoryController.getServiceCategoryById);
router.put('/:id', authenticate, authorize('ADMIN'), serviceCategoryController.updateServiceCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), serviceCategoryController.deleteServiceCategory);

export default router;