import prisma from "./prisma.service.js";
import bcrypt from "bcrypt";
import config from "../config/config.js";
import { generateRandomPassword } from "../utils/passwordGenerator.js";
import { sendWelcomeEmail } from "./email.service.js";

export const userService = {
  async getAllUsers({ page, limit, role, isSuperAgent, province }) {
    const skip = (page - 1) * limit;

    const where = {};
    if (role === "ADMIN") {
      where.role = { not: "AGENT" };
    } else {
      where.role = "AGENT";
    }

    if (isSuperAgent) {
      where.isSuperAgent = isSuperAgent === "yes";
    }
    if (province) where.location_province = province;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          phone: true,
          role: true,
          location_province: true,
          location_district: true,
          location_sector: true,
          createdAt: true,
          isActive: true,
          isSuperAgent: true,
          profileImage: true,
          nationalIdImage: true,
          commissionRate: true,
        },
      }),
    ]);

    // Convert Decimal to number for JSON serialization
    const serializedUsers = users.map(user => ({
      ...user,
      commissionRate: user.commissionRate ? parseFloat(user.commissionRate.toString()) : 0.05
    }));

    return {
      users: serializedUsers,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getAllUsersNoPagination({ role, isSuperAgent, province }) {
    const where = {};
    
    if (role === "ADMIN") {
      where.role = { not: "AGENT" };
    } else if (role === "AGENT") {
      where.role = "AGENT";
    }

    if (isSuperAgent === "yes") {
      where.isSuperAgent = true;
    } else if (isSuperAgent === "no") {
      where.isSuperAgent = false;
    }
    
    if (province) {
      where.location_province = province;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        role: true,
        location_province: true,
        location_district: true,
        location_sector: true,
        createdAt: true,
        isActive: true,
        isSuperAgent: true,
        profileImage: true,
        nationalIdImage: true,
        commissionRate: true,
      },
    });

    // Convert Decimal to number for JSON serialization
    const serializedUsers = users.map(user => ({
      ...user,
      commissionRate: user.commissionRate ? parseFloat(user.commissionRate.toString()) : 0.05
    }));

    return { 
      users: serializedUsers,
      total: users.length 
    };
  },

  async getUserById(userId) {
    if (!userId || isNaN(userId)) {
      throw new Error("Valid user ID is required");
    }

    const parsedUserId = parseInt(userId);
    
    const user = await prisma.user.findUnique({
      where: { 
        id: parsedUserId 
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        role: true,
        location_province: true,
        location_district: true,
        location_sector: true,
        createdAt: true,
        isActive: true,
        isSuperAgent: true,
        profileImage: true,
        nationalIdImage: true,
        commissionRate: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Convert Decimal to number for JSON serialization
    return {
      ...user,
      commissionRate: user.commissionRate ? parseFloat(user.commissionRate.toString()) : 0.05
    };
  },




  async updateUser(userId, updateData) {
    // Parse commission rate from updateData if it exists

    console.error( updateData.commissionRate);
    const data = {
      ...updateData,
      commissionRate: updateData.commissionRate ? parseFloat(updateData.commissionRate) : undefined
    };
  
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        role: true,
        location_province: true,
        location_district: true,
        location_sector: true,
        commissionRate: true,
      },
    });
  
    // Return the user with commission rate as a number
    return {
      ...user,
      commissionRate: parseFloat(user.commissionRate.toString())
    };
  },

  async deactivateUser(userId) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        isActive: true,
      },
    });

    return user;
  },

  async deleteUser(userId) {
    // Optional: Add soft delete or check for existing dependencies
    await prisma.user.delete({
      where: { id: userId },
    });
  },

  async storeUser(data) {
    // Check only for existing phone since it's unique
    const existingPhone = await prisma.user.findUnique({
      where: {
        phone: data.phone,
      },
    });

    if (existingPhone) {
      throw new Error("Phone number already registered");
    }

    // Use phone number as password and hash it
    const hashedPassword = await bcrypt.hash(
      data.phone,
      config.bcryptSaltRounds
    );

    const user = await prisma.user.create({
      data: { ...data, password: hashedPassword },
    });

    // Remove password before returning
    delete user.password;

    return { user };
},

  async getAllMyAgents({ page, limit, userId }) {
    const agents = await prisma.user.findMany({
      where: {
        created_by_id: userId,
        role: "AGENT",
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        location_province: true,
        location_district: true,
        location_sector: true,
        createdAt: true,
      },
    });

    const total = await prisma.user.count({
      where: {
        created_by_id: userId,
        role: "AGENT",
      },
    });

    return {
      agents,
      total,
      page,
      limit,
    };
  },
  
  async storeAgent(userData, userId) {
    // Verify that the creating user is a SuperAgent
    const creatingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isSuperAgent: true },
    });

    if (creatingUser.role !== "AGENT" || !creatingUser.isSuperAgent) {
      throw new Error("Only SuperAgents can create agents");
    }

    const randomPassword = generateRandomPassword();

    const hashedPassword = await bcrypt.hash(
      randomPassword,
      config.bcryptSaltRounds
    );

    const user = await prisma.user.create({
      data: {
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        role: "AGENT",
        created_by_id: userId, // New field to track agent creator
        location_province: userData.location_province,
        location_district: userData.location_district,
        location_sector: userData.location_sector,
      },
    });

    // Send welcome email with temporary password
    try {
      await sendWelcomeEmail({
        email: user.email,
        firstname: user.firstname,
        temporaryPassword: randomPassword,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    // Remove password before returning
    delete user.password;

    return { user };
  },

  async getAllMyAgents({ page, limit, userId }) {
    const agents = await prisma.user.findMany({
      where: {
        created_by_id: userId,
        role: "AGENT",
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        location_province: true,
        location_district: true,
        location_sector: true,
        createdAt: true,
      },
    });

    const total = await prisma.user.count({
      where: {
        created_by_id: userId,
        role: "AGENT",
      },
    });

    return {
      agents,
      total,
      page,
      limit,
    };
  },
};

