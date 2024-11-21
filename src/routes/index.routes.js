import { Router } from 'express';
import authRoutes from './auth.routes.js';
import serviceProviderRoutes from './service-provider.routes.js';
import serviceCategoryRoutes from './service-category.routes.js';
import requestRoutes from './request.routes.js';
import clientRoutes from './client.routes.js';  // Added missing import

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/service-providers', serviceProviderRoutes);
router.use('/service-categories', serviceCategoryRoutes);
router.use('/requests', requestRoutes);
router.use('/clients', clientRoutes); 

export default router;