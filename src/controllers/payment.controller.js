import { paymentService } from '../services/payment.service.js';
import { intouchService } from '../services/intouch.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const paymentController = {
  // async initiatePayment(req, res) {
  //     try {
  //       const { phone, amount, description, requestId } = req.body;

  //       // Get the request to find the associated client
  //       const request = await prisma.request.findUnique({
  //         where: { id: requestId },
  //         select: { client_id: true }
  //       });

  //       if (!request) {
  //         return res.status(404).json({
  //           success: false,
  //           message: "Request not found"
  //         });
  //       }

  //       const paymentData = {
  //         phone,
  //         amount: parseFloat(amount),
  //         description,
  //         requestId,
  //         clientId: request.client_id
  //       };

  //       const result = await intouchService.initiatePayment(paymentData);
  //       res.json(result);
  //     } catch (error) {
  //       res.status(500).json({
  //         success: false,
  //         message: error.message
  //       });
  //     }
  //   },



  async initiatePayment(req, res) {
    try {
      const { phone, amount, description, requestId } = req.body;

      // Validate input
      if (!requestId) {
        return res.status(400).json({
          success: false,
          message: "Request ID is required"
        });
      }

      // Find the request and include client information
      const request = await prisma.request.findUnique({
        where: { id: requestId },
        include: { client: true }
      });

      // Check if request exists
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found"
        });
      }

      // Ensure client exists
      if (!request.client) {
        return res.status(400).json({
          success: false,
          message: "No client associated with this request"
        });
      }

      const paymentData = {
        phone,
        amount: parseFloat(amount),
        description,
        requestId,
        clientId: request.client.id
      };

      // Log the payment data for debugging
      console.log('Payment Initiation Data:', paymentData);

      // Initiate payment
      const result = await intouchService.initiatePayment(paymentData);

      // Check if result exists and has a success status
      if (!result || !result.success) {
        return res.status(400).json({
          success: false,
          message: result?.message || "Payment initiation failed"
        });
      }

      // Update request status if payment initiation is successful
      await prisma.request.update({
        where: { id: requestId },
        data: { status: 'IN_PROGRESS' }
      });

      res.json(result);
    } catch (error) {
      console.error('Full Payment Initiation Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        errorStack: error.stack
      });
    }
  },
  async createPayment(req, res, next) {
    try {
      const payment = await paymentService.createPayment({
        ...req.body
      });
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  },

  async getAllPayments(req, res, next) {
    try {
      const payments = await paymentService.getAllPayments(req.user);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  },

  async getPaymentById(req, res, next) {
    try {
      const payment = await paymentService.getPaymentById(req.params.id);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      res.json(payment);
    } catch (error) {
      next(error);
    }
  },

  async updatePayment(req, res, next) {
    try {
      const payment = await paymentService.updatePayment(
        req.params.id,
        req.body,
        req.user
      );
      res.json(payment);
    } catch (error) {
      next(error);
    }
  },

  async deletePayment(req, res, next) {
    try {
      await paymentService.deletePayment(req.params.id, req.user);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async processPayment(req, res, next) {
    try {
      const result = await paymentService.processPayment(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // async checkPaymentStatus(req, res) {
  //   try {
  //     const { transactionId, requestTransactionId } = req.body;
  //     const result = await intouchService.checkPaymentStatus(
  //       transactionId,
  //       requestTransactionId
  //     );
  //     res.json(result);
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

  // async checkPaymentStatus(req, res) {
  //   const prisma = new PrismaClient();
  //   const transaction = await prisma.$transaction(async (tx) => {
  //     try {
  //       const { transactionId, requestTransactionId } = req.body;
  //       const result = await intouchService.checkPaymentStatus(
  //         transactionId,
  //         requestTransactionId
  //       );

  //       // If payment is successful or failed, update the associated request
  //       if (result.status === 'SUCCESSFULL' || result.status === 'FAILED') {
  //         const payment = await tx.payment.findFirst({
  //           where: { request_transaction_id: requestTransactionId },
  //           include: { request: true }
  //         });

  //         if (payment && payment.request) {
  //           await tx.request.update({
  //             where: { id: payment.request.id },
  //             data: {
  //               status: result.status === 'SUCCESSFULL' ? 'COMPLETED' : 'CANCELLED'
  //             }
  //           });
  //         }
  //       }

  //       res.json(result);
  //     } catch (error) {
  //       console.error('Payment status check error:', error);
  //       res.status(500).json({
  //         success: false,
  //         message: error.message
  //       });
  //     }
  //   });
  // }

  async checkPaymentStatus(req, res) {
    const prisma = new PrismaClient();
    
    try {
      const { transactionId, requestTransactionId } = req.body;
      
      // First, check payment status via external service
      const result = await intouchService.checkPaymentStatus(
        transactionId,
        requestTransactionId
      );
  
      // Find the associated payment and request
      const payment = await prisma.payment.findFirst({
        where: { request_transaction_id: requestTransactionId },
        include: { request: true }
      });
  
      // Update request status if payment is successful or failed
      if (payment && payment.request && 
          (result.status === 'SUCCESSFULL' || result.status === 'FAILED')) {
        await prisma.request.update({
          where: { id: payment.request.id },
          data: { 
            status: result.status === 'SUCCESSFULL' ? 'COMPLETED' : 'CANCELLED' 
          }
        });
      }
  
      res.json(result);
    } catch (error) {
      console.error('Payment status check error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};