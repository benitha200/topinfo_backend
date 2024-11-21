import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const serviceCategoryService = {
  async createServiceCategory(data) {
    return prisma.serviceCategory.create({ data });
  },

  async getAllServiceCategories() {
    return prisma.serviceCategory.findMany({
      include: { 
        service_providers: true,
        requests: true 
      }
    });
  },

  async getServiceCategoryById(id) {
    return prisma.serviceCategory.findUnique({
      where: { id: Number(id) },
      include: { 
        service_providers: true,
        requests: true 
      }
    });
  },

  async updateServiceCategory(id, data) {
    return prisma.serviceCategory.update({
      where: { id: Number(id) },
      data
    });
  },

  async deleteServiceCategory(id) {
    return prisma.serviceCategory.delete({
      where: { id: Number(id) }
    });
  }
};