import { clientService } from '../services/client.service.js';

export const clientController = {
  async createClient(req, res, next) {
    try {
      const client = await clientService.createClient({
        ...req.body
      });
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  },

  async getAllClients(req, res, next) {
    try {
      const clients = await clientService.getAllClients(req.user);
      res.json(clients);
    } catch (error) {
      next(error);
    }
  },

  async getClientById(req, res, next) {
    try {
      const client = await clientService.getClientById(req.params.id);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      res.json(client);
    } catch (error) {
      next(error);
    }
  },

  async updateClient(req, res, next) {
    try {
      const client = await clientService.updateClient(
        req.params.id,
        req.body,
        req.user
      );
      res.json(client);
    } catch (error) {
      next(error);
    }
  },

  async deleteClient(req, res, next) {
    try {
      await clientService.deleteClient(req.params.id, req.user);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};