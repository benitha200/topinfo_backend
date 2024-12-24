// import { settingsService } from '../services/settings.service.js';

// export const settingsController = {
//   async createSettings(req, res, next) {
//     try {
//       const settings = await settingsService.createSettings({
//         ...req.body
//       });
//       res.status(201).json(settings);
//     } catch (error) {
//       next(error);
//     }
//   },

//   async getSettings(req, res, next) {
//     try {
//       const settings = await settingsService.getSettings();
//       res.json(settings);
//     } catch (error) {
//       next(error);
//     }
//   },

//   async updateSettings(req, res, next) {
//     try {
//       // Assuming the first (or only) settings record has id 1
//       const settings = await settingsService.updateSettings(
//         1, 
//         req.body, 
//         req.user
//       );
//       res.json(settings);
//     } catch (error) {
//       next(error);
//     }
//   }
// };

// settings.controller.js
import { settingsService } from '../services/settings.service.js';

export const settingsController = {
  async createSettings(req, res, next) {
    try {
      const { categoryPrices, support_email } = req.body;
      const settings = await settingsService.createSettings({
        categoryPrices,
        support_email
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
      const { categoryPrices, support_email } = req.body;
      
      // Update main settings
      const settings = await settingsService.updateSettings({ support_email });
      
      // Update category prices with their IDs
      const updatedCategoryPrices = await settingsService.updateCategoryPrices(categoryPrices);
      
      res.json({
        ...settings,
        categoryPrices: updatedCategoryPrices
      });
    } catch (error) {
      next(error);
    }
  }
};