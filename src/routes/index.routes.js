import { Router } from 'express';
import authRoutes from './auth.routes.js';
import serviceRoutes from './service.routes.js';

// Import other routes

const router = Router();

router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);

// Use other routes

export default router;