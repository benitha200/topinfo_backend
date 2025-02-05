import { Router } from 'express';
import authRoutes from './auth.routes.js';
import serviceProviderRoutes from './service-provider.routes.js';
import serviceCategoryRoutes from './service-category.routes.js';
import requestRoutes from './request.routes.js';
import clientRoutes from './client.routes.js';
import paymentRoutes from './payment.routes.js';
import userRouter from './user.routes.js';
import contactRouter from './contact.route.js';
import settingsRouter from './settings.routes.js'
import agreementRouter from './agreement.routes.js';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users',userRouter);
router.use('/service-providers', serviceProviderRoutes);
router.use('/service-categories', serviceCategoryRoutes);
router.use('/requests', requestRoutes);
router.use('/clients', clientRoutes); 
router.use('/payments', paymentRoutes);
router.use('/contact', contactRouter);
router.use('/settings',settingsRouter);
router.use('/agreements',agreementRouter)

export default router;