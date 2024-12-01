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
      where: { id: Number(id) },
    });

    if (!serviceProvider) {
      throw new Error('Service Provider not found');
    }

    // Explicitly pick only the fields you want to update (excluding immutable fields like `id`)
    const updateData = {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      work_email: data.work_email,
      phone: data.phone,
      description: data.description,
      experience: data.experience,
      location_province: data.location_province,
      location_district: data.location_district,
      location_sector: data.location_sector,
      location_serve: data.location_serve,
      additional_info: data.additional_info,
      approved: data.approved,
    };

    return prisma.serviceProvider.update({
      where: { id: Number(id) },
      data: updateData,
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