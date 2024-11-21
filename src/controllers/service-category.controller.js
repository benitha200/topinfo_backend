import { serviceCategoryService } from '../services/service-category.service.js';

export const serviceCategoryController = {
  async createServiceCategory(req, res, next) {
    try {
      const category = await serviceCategoryService.createServiceCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  },

  async getAllServiceCategories(req, res, next) {
    try {
      const categories = await serviceCategoryService.getAllServiceCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  },

  async getServiceCategoryById(req, res, next) {
    try {
      const category = await serviceCategoryService.getServiceCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Service Category not found' });
      }
      res.json(category);
    } catch (error) {
      next(error);
    }
  },

  async updateServiceCategory(req, res, next) {
    try {
      const category = await serviceCategoryService.updateServiceCategory(req.params.id, req.body);
      res.json(category);
    } catch (error) {
      next(error);
    }
  },

  async deleteServiceCategory(req, res, next) {
    try {
      await serviceCategoryService.deleteServiceCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};