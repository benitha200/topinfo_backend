import express from 'express';
import { discountController } from '../controllers/discount.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Discount Partner Routes
router.get('/partners', authenticate, discountController.getAllPartners);
router.get('/partners/:id', authenticate, discountController.getPartnerById);
router.post('/partners', authenticate, authorize(['ADMIN']), discountController.createPartner);
router.put('/partners/:id', authenticate, authorize(['ADMIN']), discountController.updatePartner);
router.delete('/partners/:id', authenticate, authorize(['ADMIN']), discountController.deletePartner);

// Get partners by location or category
router.get('/partners/location/:province', authenticate, discountController.getPartnersByLocation);
router.get('/partners/category/:category', authenticate, discountController.getPartnersByCategory);

// Discount Usage Routes
router.get('/usage', authenticate, discountController.getAllUsages);
router.get('/usage/:id', authenticate, discountController.getUsageById);
router.post('/usage', authenticate, discountController.createUsage);
router.get('/usage/membership/:membershipId', authenticate, discountController.getUsageByMembership);

// Calculate discount for a membership
router.post('/calculate', authenticate, discountController.calculateDiscount);

export default router;