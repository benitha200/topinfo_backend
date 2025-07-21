import { membershipService } from '../services/membership.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const membershipController = {
  // Membership Plan Controllers
  async getAllPlans(req, res, next) {
    try {
      const plans = await membershipService.getAllPlans();
      res.json(plans);
    } catch (error) {
      next(error);
    }
  },

  async getPlanById(req, res, next) {
    try {
      const plan = await membershipService.getPlanById(req.params.id);
      if (!plan) {
        return res.status(404).json({ error: 'Membership plan not found' });
      }
      res.json(plan);
    } catch (error) {
      next(error);
    }
  },

  async createPlan(req, res, next) {
    try {
      const plan = await membershipService.createPlan(req.body);
      res.status(201).json(plan);
    } catch (error) {
      next(error);
    }
  },

  async updatePlan(req, res, next) {
    try {
      const plan = await membershipService.updatePlan(req.params.id, req.body);
      res.json(plan);
    } catch (error) {
      next(error);
    }
  },

  async deletePlan(req, res, next) {
    try {
      await membershipService.deletePlan(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // Membership Controllers
  async getAllMemberships(req, res, next) {
    try {
      const memberships = await membershipService.getAllMemberships(req.user);
      res.json(memberships);
    } catch (error) {
      next(error);
    }
  },

  async getMembershipById(req, res, next) {
    try {
      const membership = await membershipService.getMembershipById(req.params.id, req.user);
      if (!membership) {
        return res.status(404).json({ error: 'Membership not found' });
      }
      res.json(membership);
    } catch (error) {
      next(error);
    }
  },

  async createMembership(req, res, next) {
    try {
      const membership = await membershipService.createMembership(req.body, req.user);
      res.status(201).json(membership);
    } catch (error) {
      next(error);
    }
  },

  async updateMembership(req, res, next) {
    try {
      const membership = await membershipService.updateMembership(req.params.id, req.body, req.user);
      res.json(membership);
    } catch (error) {
      next(error);
    }
  },

  async deleteMembership(req, res, next) {
    try {
      await membershipService.deleteMembership(req.params.id, req.user);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async cancelMembership(req, res, next) {
    try {
      const membership = await membershipService.cancelMembership(req.params.id, req.user);
      res.json(membership);
    } catch (error) {
      next(error);
    }
  },

  async renewMembership(req, res, next) {
    try {
      const membership = await membershipService.renewMembership(req.params.id, req.user);
      res.json(membership);
    } catch (error) {
      next(error);
    }
  },

  async getClientMemberships(req, res, next) {
    try {
      const memberships = await membershipService.getClientMemberships(req.params.clientId, req.user);
      res.json(memberships);
    } catch (error) {
      next(error);
    }
  },

  async getActiveClientMembership(req, res, next) {
    try {
      const membership = await membershipService.getActiveClientMembership(req.params.clientId, req.user);
      res.json(membership);
    } catch (error) {
      next(error);
    }
  },

  // Membership Payment Controllers
  async initiateMembershipPayment(req, res, next) {
    try {
      const {
        client_id,
        plan_id,
        paymentNumber,
        paymentMethod
      } = req.body;

      // Get the membership plan
      const plan = await prisma.membershipPlan.findUnique({
        where: { id: plan_id }
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: "Membership plan not found"
        });
      }

      // Create membership payment record
      const currentDate = new Date();
      const txRef = `MB-${currentDate.getTime()}`;
      const orderId = `MEM_${currentDate.getTime()}`;

      const payment = await prisma.payment.create({
        data: {
          amount: plan.price,
          phone_number: paymentNumber,
          transaction_id: txRef,
          request_transaction_id: orderId,
          client_id,
          status: "PENDING",
        },
      });

      // Here you would integrate with your payment service
      // For now, we'll simulate a successful payment initiation
      const paymentData = {
        paymentId: payment.id,
        client_id,
        plan_id,
        amount: parseFloat(plan.price),
        paymentMethod,
        type: 'membership'
      };

      res.json({
        success: true,
        payment: paymentData,
        transactionId: txRef,
        orderId
      });
    } catch (error) {
      next(error);
    }
  },

  async membershipPaymentCallback(req, res, next) {
    try {
      const { tx_ref, status } = req.body;

      // Find the payment record
      const payment = await prisma.payment.findFirst({
        where: { transaction_id: tx_ref }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment record not found"
        });
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: status === 'successful' ? 'COMPLETED' : 'FAILED' }
      });

      // If payment is successful, create the membership
      if (status === 'successful') {
        // Extract plan_id and client_id from payment metadata or request
        // You might need to store this in the payment record or pass it differently
        const { plan_id, client_id, paymentMethod } = req.body;

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1); // Add 1 year

        const membership = await prisma.membership.create({
          data: {
            client_id,
            plan_id,
            startDate,
            endDate,
            paymentMethod,
            status: 'ACTIVE'
          }
        });

        // Link payment to membership
        await prisma.payment.update({
          where: { id: payment.id },
          data: { membership_id: membership.id }
        });
      }

      res.status(200).json({
        success: true,
        message: "Membership payment processed successfully"
      });
    } catch (error) {
      next(error);
    }
  }
};