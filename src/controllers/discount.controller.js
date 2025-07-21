import { discountService } from '../services/discount.service.js';

export const discountController = {
  // Discount Partner Controllers
  async getAllPartners(req, res, next) {
    try {
      const partners = await discountService.getAllPartners();
      res.json(partners);
    } catch (error) {
      next(error);
    }
  },

  async getPartnerById(req, res, next) {
    try {
      const partner = await discountService.getPartnerById(req.params.id);
      if (!partner) {
        return res.status(404).json({ error: 'Discount partner not found' });
      }
      res.json(partner);
    } catch (error) {
      next(error);
    }
  },

  async createPartner(req, res, next) {
    try {
      const partner = await discountService.createPartner(req.body);
      res.status(201).json(partner);
    } catch (error) {
      next(error);
    }
  },

  async updatePartner(req, res, next) {
    try {
      const partner = await discountService.updatePartner(req.params.id, req.body);
      res.json(partner);
    } catch (error) {
      next(error);
    }
  },

  async deletePartner(req, res, next) {
    try {
      await discountService.deletePartner(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getPartnersByLocation(req, res, next) {
    try {
      const partners = await discountService.getPartnersByLocation(req.params.province);
      res.json(partners);
    } catch (error) {
      next(error);
    }
  },

  async getPartnersByCategory(req, res, next) {
    try {
      const partners = await discountService.getPartnersByCategory(req.params.category);
      res.json(partners);
    } catch (error) {
      next(error);
    }
  },

  // Discount Usage Controllers
  async getAllUsages(req, res, next) {
    try {
      const usages = await discountService.getAllUsages(req.user);
      res.json(usages);
    } catch (error) {
      next(error);
    }
  },

  async getUsageById(req, res, next) {
    try {
      const usage = await discountService.getUsageById(req.params.id, req.user);
      if (!usage) {
        return res.status(404).json({ error: 'Discount usage not found' });
      }
      res.json(usage);
    } catch (error) {
      next(error);
    }
  },

  async createUsage(req, res, next) {
    try {
      const usage = await discountService.createUsage(req.body, req.user);
      res.status(201).json(usage);
    } catch (error) {
      next(error);
    }
  },

  async getUsageByMembership(req, res, next) {
    try {
      const usages = await discountService.getUsageByMembership(req.params.membershipId, req.user);
      res.json(usages);
    } catch (error) {
      next(error);
    }
  },

  async calculateDiscount(req, res, next) {
    try {
      const { membershipId, partnerId, originalAmount } = req.body;
      
      const discountCalculation = await discountService.calculateDiscount(
        membershipId, 
        partnerId, 
        originalAmount,
        req.user
      );
      
      res.json(discountCalculation);
    } catch (error) {
      next(error);
    }
  }
};