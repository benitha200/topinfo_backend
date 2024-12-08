import { settingsService } from '../services/settings.service.js';

export const settingsController = {
  async createSettings(req, res, next) {
    try {
      const settings = await settingsService.createSettings({
        ...req.body
      });
      res.status(201).json(settings);
    } catch (error) {
      next(error);
    }
  },

  async getSettings(req, res, next) {
    try {
      const settings = await settingsService.getSettings();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req, res, next) {
    try {
      // Assuming the first (or only) settings record has id 1
      const settings = await settingsService.updateSettings(
        1, 
        req.body, 
        req.user
      );
      res.json(settings);
    } catch (error) {
      next(error);
    }
  }
};