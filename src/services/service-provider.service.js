import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const serviceProviderService = {
  async createServiceProvider(data) {
    return prisma.serviceProvider.create({ data });
  },

  async getAllServiceProviders() {
    return prisma.serviceProvider.findMany({
      include: { service_category: true }
    });
  },

  async getServiceProviderById(id) {
    return prisma.serviceProvider.findUnique({
      where: { id: Number(id) },
      include: { service_category: true }
    });
  },

  async updateServiceProvider(id, data, user) {
    // Ensure only the service provider or admin can update
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { id: Number(id) }
    });

    if (!serviceProvider) {
      throw new Error('Service Provider not found');
    }

    return prisma.serviceProvider.update({
      where: { id: Number(id) },
      data
    });
  },

  async deleteServiceProvider(id) {
    return prisma.serviceProvider.delete({
      where: { id: Number(id) }
    });
  },

  async approveServiceProvider(id, adminId) {
    return prisma.serviceProvider.update({
      where: { id: Number(id) },
      data: { 
        approved: true,
        approved_by: adminId 
      }
    });
  }
};