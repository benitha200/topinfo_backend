import { serviceProviderService } from '../services/service-provider.service.js';

export const serviceProviderController = {
  async createServiceProvider(req, res, next) {
    try {
      const serviceProvider = await serviceProviderService.createServiceProvider(req.body);
      res.status(201).json(serviceProvider);
    } catch (error) {
      next(error);
    }
  },

  async getAllServiceProviders(req, res, next) {
    try {
      const serviceProviders = await serviceProviderService.getAllServiceProviders();
      res.json(serviceProviders);
    } catch (error) {
      next(error);
    }
  },

  async getServiceProviderById(req, res, next) {
    try {
      const serviceProvider = await serviceProviderService.getServiceProviderById(req.params.id);
      if (!serviceProvider) {
        return res.status(404).json({ error: 'Service Provider not found' });
      }
      res.json(serviceProvider);
    } catch (error) {
      next(error);
    }
  },

  async updateServiceProvider(req, res, next) {
    try {
      const serviceProvider = await serviceProviderService.updateServiceProvider(
        req.params.id, 
        req.body, 
        req.user
      );
      res.json(serviceProvider);
    } catch (error) {
      next(error);
    }
  },

  async deleteServiceProvider(req, res, next) {
    try {
      await serviceProviderService.deleteServiceProvider(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async approveServiceProvider(req, res, next) {
    try {
      const serviceProvider = await serviceProviderService.approveServiceProvider(
        req.params.id, 
        req.user.id
      );
      res.json(serviceProvider);
    } catch (error) {
      next(error);
    }
  }
};