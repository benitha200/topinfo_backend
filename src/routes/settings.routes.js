import express from 'express';
import { settingsController } from '../controllers/settings.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { Router } from 'express';

const router = Router();

// Create and update settings still require admin authentication
router.post('/', 
  authenticate,
  authorize(['ADMIN']),
  settingsController.createSettings
);

// GET settings no longer requires authentication
router.get('/', 
  settingsController.getSettings 
);

router.put('/', 
  authenticate,
  settingsController.updateSettings
);

export default router;