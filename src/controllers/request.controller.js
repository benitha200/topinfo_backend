import { requestService } from '../services/request.service.js';

export const requestController = {
  async createRequest(req, res, next) {
    try {
      const request = await requestService.createRequest({
        ...req.body
      });
      res.status(201).json(request);
    } catch (error) {
      next(error);
    }
  },

  async getAllRequests(req, res, next) {
    try {
      const requests = await requestService.getAllRequests(req.user);
      res.json(requests);
    } catch (error) {
      next(error);
    }
  },

  async getRequestById(req, res, next) {
    try {
      const request = await requestService.getRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      res.json(request);
    } catch (error) {
      next(error);
    }
  },

  async updateRequest(req, res, next) {
    try {
      const request = await requestService.updateRequest(
        req.params.id, 
        req.body, 
        req.user
      );
      res.json(request);
    } catch (error) {
      next(error);
    }
  },

  async deleteRequest(req, res, next) {
    try {
      await requestService.deleteRequest(req.params.id, req.user);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async assignAgent(req, res, next) {
    try {
      const request = await requestService.assignAgent(
        req.params.id, 
        req.user.id
      );
      res.json(request);
    } catch (error) {
      next(error);
    }
  },

  async changeRequestStatus(req, res, next) {
    try {
      const request = await requestService.changeRequestStatus(
        req.params.id, 
        req.body.status, 
        req.user
      );
      res.json(request);
    } catch (error) {
      next(error);
    }
  }
};