import express from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/callback', paymentController.webhookcallback);
router.post('/', authenticate, paymentController.createPayment);
router.get('/', authenticate, paymentController.getAllPayments);
router.get('/:id', authenticate, paymentController.getPaymentById);
router.put('/:id', authenticate, paymentController.updatePayment);
router.delete('/:id', authenticate, paymentController.deletePayment);
router.post('/process', authenticate, paymentController.processPayment);
router.post('/status', authenticate, paymentController.checkPaymentStatus);
router.post('/initiate', paymentController.initiatePayment);
router.post('/callback', paymentController.paymentCallback);
router.post('/provider-initiate', paymentController.providerInitiatePayment);
router.post('/provider-callback', paymentController.providerPaymentCallback);
router.post('/status', paymentController.checkPaymentStatus);

export default router;