import { paymentService } from '../services/payment.service.js';
import { intouchService } from '../services/intouch.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const paymentController = {
    async initiatePayment(req, res) {
        try {
          const { phone, amount, description, requestId } = req.body;
          
          // Get the request to find the associated client
          const request = await prisma.request.findUnique({
            where: { id: requestId },
            select: { client_id: true }
          });
    
          if (!request) {
            return res.status(404).json({
              success: false,
              message: "Request not found"
            });
          }
    
          const paymentData = {
            phone,
            amount: parseFloat(amount),
            description,
            requestId,
            clientId: request.client_id
          };
    
          const result = await intouchService.initiatePayment(paymentData);
          res.json(result);
        } catch (error) {
          res.status(500).json({
            success: false,
            message: error.message
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

async checkPaymentStatus(req, res) {
    try {
      const { transactionId, requestTransactionId } = req.body;
      const result = await intouchService.checkPaymentStatus(
        transactionId,
        requestTransactionId
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
};