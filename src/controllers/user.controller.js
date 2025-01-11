import { userService } from "../services/user.service.js";
import prisma from "../services/prisma.service.js";
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

  async getAllUsersNoPagination(req, res, next) {
    try {
      const { role, isSuperAgent, province } = req.query;
      const result = await userService.getAllUsersNoPagination({
        role,
        isSuperAgent,
        province
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req, res, next) {
    try {
      const userId = req.params.id;

      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          error: "Invalid user ID provided"
        });
      }

      const user = await userService.getUserById(userId);
      res.json(user);
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: "User not found" });
      }
      if (error.message === "Valid user ID is required") {
        return res.status(400).json({ error: "Valid user ID is required" });
      }
      next(error);
    }
  },

  async createUser(req, res, next) {
    try {
      const {
        firstname,
        lastname,
        email,
        phone,
        location_province,
        location_district,
        location_sector,
        isSuperAgent,
        role
      } = req.body;

      const profileImagePath = req.files?.profileImage?.[0]?.path || null;
      const nationalIdImagePath = req.files?.nationalIdImage?.[0]?.path || null;

      const data = {
        firstname,
        lastname,
        email,
        phone,
        location_province,
        location_district,
        location_sector,
        role,
        isSuperAgent: isSuperAgent === "true",
        profileImage: profileImagePath,
        nationalIdImage: nationalIdImagePath,
      };

      const result = await userService.storeUser(data);
      res.status(201).json({
        message: "User registered successfully",
        user: result.user,
      });
    } catch (error) {
      if (error.message === "Phone number already registered") {
        return res.status(400).json({
          error: "Phone number already registered"
        });
      }
      next(error);
    }
  },

  async createAgent(req, res, next) {
    try {
      const userId = req.user.id;
      const { phone } = req.body;

      // Check if phone number already exists
      const existingUser = await prisma.user.findUnique({
        where: { phone }
      });

      if (existingUser) {
        return res.status(400).json({
          error: "Phone number already registered"
        });
      }

      // Add created_by_id to the agent data
      const agentData = {
        ...req.body,
        created_by_id: userId
      };

      const result = await userService.storeAgent(agentData, userId);
      res.status(201).json({
        message: "Agent registered successfully",
        user: result.user,
      });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('phone')) {
        return res.status(400).json({
          error: "Phone number already registered"
        });
      }
      next(error);
    }
  },


  async getMyAgents(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1; // Default to page 1
      const limit = parseInt(req.query.limit, 10) || 10; // Default limit per page
      const search = req.query.search || ''; // Search term
      const offset = (page - 1) * limit;

      const userId = req.user.id; // Get the logged-in user's ID

      // Fetch agents with search and pagination
      const agents = await prisma.user.findMany({
        where: {
          created_by_id: userId, // Use the correct field name from your schema
          OR: search
            ? [
              { firstname: { contains: search, mode: 'insensitive' } },
              { lastname: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
            : undefined,
        },
        skip: offset, // Pagination offset
        take: limit, // Pagination limit
        orderBy: { createdAt: 'desc' }, // Order by creation date in descending order
      });

      // Get the total count of agents
      const totalAgents = await prisma.user.count({
        where: {
          created_by_id: userId, // Use the correct field name from your schema
          OR: search
            ? [
              { firstname: { contains: search, mode: 'insensitive' } },
              { lastname: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
            : undefined,
        },
      });

      // Respond with the fetched data
      res.json({
        agents,
        totalPages: Math.ceil(totalAgents / limit),
        totalAgents,
      });
    } catch (error) {
      console.error('Error in getMyAgents:', error);
      res.status(500).json({ error: 'Failed to fetch agents' });
    }
  },




  async updateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
  
      const {
        firstname,
        lastname,
        email,
        phone,
        location_province,
        location_district,
        location_sector,
        commissionRate,
      } = req.body;
  
      // Data to update
      const updateData = {
        firstname,
        lastname,
        email,
        phone,
        location_province,
        location_district,
        location_sector,
        commissionRate: commissionRate ? parseFloat(commissionRate) : undefined,
      };
  
      // Only add image paths if files were uploaded
      if (req.files?.profileImage?.[0]?.path) {
        updateData.profileImage = req.files.profileImage[0].path;
      }
      if (req.files?.nationalIdImage?.[0]?.path) {
        updateData.nationalIdImage = req.files.nationalIdImage[0].path;
      }
  
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
