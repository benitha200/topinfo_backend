import { serviceService } from '../services/service.service.js';

export const serviceController = {
  async getAllServices(req, res, next) {
    try {
      const services = await serviceService.getAllServices();
      res.json(services);
    } catch (error) {
      next(error);
    }
  },

  async getServiceById(req, res, next) {
    try {
      const service = await serviceService.getServiceById(req.params.id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.json(service);
    } catch (error) {
      next(error);
    }
  },

  async createService(req, res, next) {
    try {
      const service = await serviceService.createService({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(service);
    } catch (error) {
      next(error);
    }
  },

  async updateService(req, res, next) {
    try {
      const service = await serviceService.updateService(req.params.id, req.body);
      res.json(service);
    } catch (error) {
      next(error);
    }
  },
};
