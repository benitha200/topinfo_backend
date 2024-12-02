import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const serviceProviderService = {
  async createServiceProvider(data) {
    // Prepare data for database insertion
    const serviceProviderData = {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      work_email: data.work_email || null,
      phone: data.phone,
      description: data.description,
      experience: data.experience,
      
      // Location details
      location_province: data.location_province,
      location_district: data.location_district,
      location_sector: data.location_sector,
      location_serve: data.location_serve || null,
      
      // Additional information
      additional_info: data.additional_info || null,
      
      // Service category relationship
      service_category_id: Number(data.service_category_id),
      
      // Provinces and districts as comma-separated strings
      provinces: Array.isArray(data.provinces)
        ? data.provinces.map(p => (p?.value || p)).join(', ')
        : data.provinces || null,
      districts: Array.isArray(data.districts)
        ? data.districts.map(d => (d?.value || d)).join(', ')
        : data.districts || null,
      
      // Total district cost
      total_district_cost: data.total_district_cost ? Number(data.total_district_cost) : 0,
      
      // Approval status
      approved: false,
      approved_by: null
    };

    // Create service provider
    return prisma.serviceProvider.create({ 
      data: serviceProviderData 
    });
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

  async updateServiceProvider(id, data) {
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { id: Number(id) },
    });

    if (!serviceProvider) {
      throw new Error('Service Provider not found');
    }

    const updateData = {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      work_email: data.work_email || null,
      phone: data.phone,
      description: data.description,
      experience: data.experience,
      location_province: data.location_province,
      location_district: data.location_district,
      location_sector: data.location_sector,
      location_serve: data.location_serve || null,
      additional_info: data.additional_info || null,
      approved: data.approved || false,
      
      // Add these fields for update
      provinces: Array.isArray(data.provinces)
        ? data.provinces.map(p => (p?.value || p)).join(', ')
        : data.provinces || null,
      districts: Array.isArray(data.districts)
        ? data.districts.map(d => (d?.value || d)).join(', ')
        : data.districts || null,
      total_district_cost: data.total_district_cost ? Number(data.total_district_cost) : 0,
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
