import prisma from './prisma.service.js';
import bcrypt from 'bcrypt';
import config from '../config/config.js';

export const userService = {
  async getAllUsers({ page, limit, role, province }) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (role) where.role = role;
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
          isActive: true
        }
      })
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    };
  },

  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        isActive: true
      }
    });

    if (!user) throw new Error('User not found');
    return user;
  },

  async updateUser(userId, updateData) {
    // Prevent updating sensitive fields
    const { password, email, ...safeUpdateData } = updateData;

    // Optional: Hash password if provided
    if (password) {
      safeUpdateData.password = await bcrypt.hash(
        password, 
        config.bcryptSaltRounds
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: safeUpdateData,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        role: true,
        location_province: true,
        location_district: true,
        location_sector: true
      }
    });

    return user;
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
        isActive: true
      }
    });

    return user;
  },

  async deleteUser(userId) {
    // Optional: Add soft delete or check for existing dependencies
    await prisma.user.delete({
      where: { id: userId }
    });
  }
};