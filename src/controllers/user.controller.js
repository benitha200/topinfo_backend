import { userService } from '../services/user.service.js';

export const userController = {
  async getAllUsers(req, res, next) {
    try {
      // Optional: Add pagination and filtering
      const { page = 1, limit = 10, role, province } = req.query;
      const users = await userService.getAllUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        role,
        province
      });
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const user = await userService.getUserById(userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      const user = await userService.updateUser(userId, updateData);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async deactivateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const user = await userService.deactivateUser(userId);
      res.json({
        message: 'User deactivated successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      await userService.deleteUser(userId);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};