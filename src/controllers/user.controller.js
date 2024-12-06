import { userService } from "../services/user.service.js";

export const userController = {
  async getAllUsers(req, res, next) {
    try {
      // Optional: Add pagination and filtering
      const { page = 1, limit = 10, role, isSuperAgent, province } = req.query;
      // return res.json(req.query);
      const users = await userService.getAllUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        role,
        isSuperAgent,
        province,
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

  async createUser(req, res, next) {
    try {
      const result = await userService.storeUser(req.body);
      res.status(201).json({
        message: "User registered successfully",
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  },
  async createAgent(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await userService.storeAgent(req.body, userId);
      res.status(201).json({
        message: "Agent registered successfully",
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  },
  async getMyAgents(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user.id;
      const agents = await userService.getAllMyAgents({
        page: parseInt(page),
        limit: parseInt(limit),
        userId  // Pass userId instead of created_by_id
      });
      res.json(agents);
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
        message: "User deactivated successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      await userService.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
};
