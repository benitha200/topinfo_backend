import express from 'express';
import { membershipController } from '../controllers/membership.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Membership Plan Routes
router.get('/plans', membershipController.getAllPlans);
router.get('/plans/:id', membershipController.getPlanById);
router.post('/plans', authenticate, authorize(['ADMIN']), membershipController.createPlan);
router.put('/plans/:id', authenticate, authorize(['ADMIN']), membershipController.updatePlan);
router.delete('/plans/:id', authenticate, authorize(['ADMIN']), membershipController.deletePlan);

// Membership Routes
router.get('/', authenticate, membershipController.getAllMemberships);
router.get('/:id', authenticate, membershipController.getMembershipById);
router.post('/', authenticate, membershipController.createMembership);
router.put('/:id', authenticate, membershipController.updateMembership);
router.delete('/:id', authenticate, membershipController.deleteMembership);
router.post('/cancel/:id', authenticate, membershipController.cancelMembership);
router.post('/renew/:id', authenticate, membershipController.renewMembership);

// Client specific membership routes
router.get('/client/:clientId', authenticate, membershipController.getClientMemberships);
router.get('/client/:clientId/active', authenticate, membershipController.getActiveClientMembership);

// Membership payment routes
router.post('/payment/initiate', authenticate, membershipController.initiateMembershipPayment);
router.post('/payment/callback', membershipController.membershipPaymentCallback);

export default router;