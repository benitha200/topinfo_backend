import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const discountService = {
  // Discount Partner Services
  async getAllPartners() {
    try {
      return await prisma.discountPartner.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      throw new Error(`Failed to fetch discount partners: ${error.message}`);
    }
  },

  async getPartnerById(id) {
    try {
      return await prisma.discountPartner.findUnique({
        where: { id: Number(id) }
      });
    } catch (error) {
      throw new Error(`Failed to fetch discount partner: ${error.message}`);
    }
  },

  async createPartner(data) {
    try {
      return await prisma.discountPartner.create({
        data: {
          name: data.name,
          description: data.description,
          location_province: data.location_province,
          location_district: data.location_district,
          location_sector: data.location_sector,
          category: data.category,
          discount_silver: data.discount_silver,
          discount_gold: data.discount_gold,
          discount_platinum: data.discount_platinum,
          discount_diamond: data.discount_diamond,
          contact_info: data.contact_info,
          isActive: data.isActive ?? true
        }
      });
    } catch (error) {
      throw new Error(`Failed to create discount partner: ${error.message}`);
    }
  },

  async updatePartner(id, data) {
    try {
      const existingPartner = await prisma.discountPartner.findUnique({
        where: { id: Number(id) }
      });
      
      if (!existingPartner) {
        throw new Error('Discount partner not found');
      }

      return await prisma.discountPartner.update({
        where: { id: Number(id) },
        data: {
          name: data.name,
          description: data.description,
          location_province: data.location_province,
          location_district: data.location_district,
          location_sector: data.location_sector,
          category: data.category,
          discount_silver: data.discount_silver,
          discount_gold: data.discount_gold,
          discount_platinum: data.discount_platinum,
          discount_diamond: data.discount_diamond,
          contact_info: data.contact_info,
          isActive: data.isActive
        }
      });
    } catch (error) {
      throw new Error(`Failed to update discount partner: ${error.message}`);
    }
  },

  async deletePartner(id) {
    try {
      const existingPartner = await prisma.discountPartner.findUnique({
        where: { id: Number(id) }
      });
      
      if (!existingPartner) {
        throw new Error('Discount partner not found');
      }

      return await prisma.discountPartner.delete({
        where: { id: Number(id) }
      });
    } catch (error) {
      throw new Error(`Failed to delete discount partner: ${error.message}`);
    }
  },

  async deactivatePartner(id) {
    try {
      const existingPartner = await prisma.discountPartner.findUnique({
        where: { id: Number(id) }
      });
      
      if (!existingPartner) {
        throw new Error('Discount partner not found');
      }

      return await prisma.discountPartner.update({
        where: { id: Number(id) },
        data: { isActive: false }
      });
    } catch (error) {
      throw new Error(`Failed to deactivate discount partner: ${error.message}`);
    }
  },

  async getPartnersByCategory(category) {
    try {
      return await prisma.discountPartner.findMany({
        where: { 
          category: category,
          isActive: true 
        },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      throw new Error(`Failed to fetch partners by category: ${error.message}`);
    }
  },

  async getPartnersByLocation(province, district = null, sector = null) {
    try {
      const whereClause = {
        location_province: province,
        isActive: true
      };

      if (district) {
        whereClause.location_district = district;
      }

      if (sector) {
        whereClause.location_sector = sector;
      }

      return await prisma.discountPartner.findMany({
        where: whereClause,
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      throw new Error(`Failed to fetch partners by location: ${error.message}`);
    }
  },

  // Discount Application Services
  async applyDiscount(userId, partnerId, membershipTier) {
    try {
      const partner = await prisma.discountPartner.findUnique({
        where: { id: Number(partnerId) }
      });

      if (!partner || !partner.isActive) {
        throw new Error('Discount partner not found or inactive');
      }

      // Get discount percentage based on membership tier
      let discountPercentage = 0;
      switch (membershipTier.toLowerCase()) {
        case 'silver':
          discountPercentage = partner.discount_silver;
          break;
        case 'gold':
          discountPercentage = partner.discount_gold;
          break;
        case 'platinum':
          discountPercentage = partner.discount_platinum;
          break;
        case 'diamond':
          discountPercentage = partner.discount_diamond;
          break;
        default:
          throw new Error('Invalid membership tier');
      }

      // Create discount application record
      return await prisma.discountApplication.create({
        data: {
          userId: Number(userId),
          partnerId: Number(partnerId),
          membershipTier: membershipTier,
          discountPercentage: discountPercentage,
          applicationDate: new Date(),
          status: 'PENDING'
        }
      });
    } catch (error) {
      throw new Error(`Failed to apply discount: ${error.message}`);
    }
  },

  async getUserDiscountApplications(userId) {
    try {
      return await prisma.discountApplication.findMany({
        where: { userId: Number(userId) },
        include: {
          partner: {
            select: {
              name: true,
              category: true,
              location_province: true,
              location_district: true,
              location_sector: true
            }
          }
        },
        orderBy: { applicationDate: 'desc' }
      });
    } catch (error) {
      throw new Error(`Failed to fetch user discount applications: ${error.message}`);
    }
  },

  async updateDiscountApplicationStatus(applicationId, status) {
    try {
      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'USED'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      return await prisma.discountApplication.update({
        where: { id: Number(applicationId) },
        data: { 
          status: status,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Failed to update discount application status: ${error.message}`);
    }
  },

  async getDiscountApplicationById(applicationId) {
    try {
      return await prisma.discountApplication.findUnique({
        where: { id: Number(applicationId) },
        include: {
          partner: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch discount application: ${error.message}`);
    }
  },

  // Analytics and Reporting
  async getPartnerAnalytics(partnerId) {
    try {
      const totalApplications = await prisma.discountApplication.count({
        where: { partnerId: Number(partnerId) }
      });

      const approvedApplications = await prisma.discountApplication.count({
        where: { 
          partnerId: Number(partnerId),
          status: 'APPROVED'
        }
      });

      const usedApplications = await prisma.discountApplication.count({
        where: { 
          partnerId: Number(partnerId),
          status: 'USED'
        }
      });

      const applicationsByTier = await prisma.discountApplication.groupBy({
        by: ['membershipTier'],
        where: { partnerId: Number(partnerId) },
        _count: { id: true }
      });

      return {
        totalApplications,
        approvedApplications,
        usedApplications,
        applicationsByTier
      };
    } catch (error) {
      throw new Error(`Failed to fetch partner analytics: ${error.message}`);
    }
  },

  async getSystemAnalytics() {
    try {
      const totalPartners = await prisma.discountPartner.count();
      const activePartners = await prisma.discountPartner.count({
        where: { isActive: true }
      });

      const totalApplications = await prisma.discountApplication.count();
      const applicationsByStatus = await prisma.discountApplication.groupBy({
        by: ['status'],
        _count: { id: true }
      });

      const partnersByCategory = await prisma.discountPartner.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: { id: true }
      });

      return {
        totalPartners,
        activePartners,
        totalApplications,
        applicationsByStatus,
        partnersByCategory
      };
    } catch (error) {
      throw new Error(`Failed to fetch system analytics: ${error.message}`);
    }
  },

  // Utility methods
  async searchPartners(searchTerm) {
    try {
      return await prisma.discountPartner.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { category: { contains: searchTerm, mode: 'insensitive' } }
              ]
            }
          ]
        },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      throw new Error(`Failed to search partners: ${error.message}`);
    }
  },

  async validateMembershipTier(tier) {
    const validTiers = ['silver', 'gold', 'platinum', 'diamond'];
    return validTiers.includes(tier.toLowerCase());
  },

  async getDiscountByTier(partnerId, tier) {
    try {
      const partner = await prisma.discountPartner.findUnique({
        where: { id: Number(partnerId) }
      });

      if (!partner) {
        throw new Error('Partner not found');
      }

      switch (tier.toLowerCase()) {
        case 'silver':
          return partner.discount_silver;
        case 'gold':
          return partner.discount_gold;
        case 'platinum':
          return partner.discount_platinum;
        case 'diamond':
          return partner.discount_diamond;
        default:
          throw new Error('Invalid membership tier');
      }
    } catch (error) {
      throw new Error(`Failed to get discount by tier: ${error.message}`);
    }
  }
};