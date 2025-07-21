import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const membershipService = {
  // Membership Plan Services
  async getAllPlans() {
    try {
      return await prisma.membershipPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
      });
    } catch (error) {
      throw new Error(`Failed to fetch membership plans: ${error.message}`);
    }
  },

  async getPlanById(id) {
    try {
      return await prisma.membershipPlan.findUnique({
        where: { id: Number(id) },
        include: {
          memberships: {
            include: {
              client: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  email: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch membership plan: ${error.message}`);
    }
  },

  async createPlan(data) {
    try {
      return await prisma.membershipPlan.create({
        data: {
          name: data.name,
          displayName: data.displayName,
          price: data.price,
          features: data.features,
          description: data.description,
          isActive: data.isActive ?? true
        }
      });
    } catch (error) {
      throw new Error(`Failed to create membership plan: ${error.message}`);
    }
  },

  async updatePlan(id, data) {
    try {
      const existingPlan = await prisma.membershipPlan.findUnique({
        where: { id: Number(id) }
      });

      if (!existingPlan) {
        throw new Error('Membership plan not found');
      }

      return await prisma.membershipPlan.update({
        where: { id: Number(id) },
        data: {
          name: data.name,
          displayName: data.displayName,
          price: data.price,
          features: data.features,
          description: data.description,
          isActive: data.isActive
        }
      });
    } catch (error) {
      throw new Error(`Failed to update membership plan: ${error.message}`);
    }
  },

  async deletePlan(id) {
    try {
      const existingPlan = await prisma.membershipPlan.findUnique({
        where: { id: Number(id) },
        include: { memberships: true }
      });

      if (!existingPlan) {
        throw new Error('Membership plan not found');
      }

      // Check if plan has active memberships
      const activeMemberships = existingPlan.memberships.filter(m => m.status === 'ACTIVE');
      if (activeMemberships.length > 0) {
        throw new Error('Cannot delete plan with active memberships');
      }

      return await prisma.membershipPlan.delete({
        where: { id: Number(id) }
      });
    } catch (error) {
      throw new Error(`Failed to delete membership plan: ${error.message}`);
    }
  },

  // Membership Services
  async getAllMemberships(user) {
    try {
      const where = user.role === 'ADMIN' 
        ? {} 
        : { client_id: user.id };

      return await prisma.membership.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true
            }
          },
          plan: true,
          payments: true,
          discountUsages: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      throw new Error(`Failed to fetch memberships: ${error.message}`);
    }
  },

  async getMembershipById(id, user) {
    try {
      const membership = await prisma.membership.findUnique({
        where: { id: Number(id) },
        include: {
          client: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true
            }
          },
          plan: true,
          payments: true,
          discountUsages: {
            include: {
              membership: true
            }
          }
        }
      });

      if (!membership) {
        throw new Error('Membership not found');
      }

      // Check authorization
      const canAccess = user.role === 'ADMIN' || user.id === membership.client_id;
      if (!canAccess) {
        throw new Error('Unauthorized to access this membership');
      }

      return membership;
    } catch (error) {
      throw new Error(`Failed to fetch membership: ${error.message}`);
    }
  },

  async createMembership(data, user) {
    try {
      // Verify the plan exists
      const plan = await prisma.membershipPlan.findUnique({
        where: { id: data.plan_id }
      });

      if (!plan) {
        throw new Error('Membership plan not found');
      }

      // Check if client exists
      const client = await prisma.client.findUnique({
        where: { id: data.client_id }
      });

      if (!client) {
        throw new Error('Client not found');
      }

      // Check authorization - only admin or the client themselves can create
      const canCreate = user.role === 'ADMIN' || user.id === data.client_id;
      if (!canCreate) {
        throw new Error('Unauthorized to create membership for this client');
      }

      // Calculate end date (1 year from start date)
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      return await prisma.membership.create({
        data: {
          client_id: data.client_id,
          plan_id: data.plan_id,
          startDate,
          endDate,
          paymentMethod: data.paymentMethod,
          autoRenewal: data.autoRenewal ?? false,
          status: 'ACTIVE'
        },
        include: {
          client: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true
            }
          },
          plan: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to create membership: ${error.message}`);
    }
  },

  async updateMembership(id, data, user) {
    try {
      const existingMembership = await prisma.membership.findUnique({
        where: { id: Number(id) },
        include: { client: true }
      });

      if (!existingMembership) {
        throw new Error('Membership not found');
      }

      // Check authorization
      const canUpdate = user.role === 'ADMIN' || user.id === existingMembership.client_id;
      if (!canUpdate) {
        throw new Error('Unauthorized to update this membership');
      }

      return await prisma.membership.update({
        where: { id: Number(id) },
        data: {
          paymentMethod: data.paymentMethod,
          autoRenewal: data.autoRenewal,
          status: data.status
        },
        include: {
          client: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true
            }
          },
          plan: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to update membership: ${error.message}`);
    }
  },

  async deleteMembership(id, user) {
    try {
      const existingMembership = await prisma.membership.findUnique({
        where: { id: Number(id) },
        include: { client: true }
      });

      if (!existingMembership) {
        throw new Error('Membership not found');
      }

      // Check authorization
      const canDelete = user.role === 'ADMIN' || user.id === existingMembership.client_id;
      if (!canDelete) {
        throw new Error('Unauthorized to delete this membership');
      }

      return await prisma.membership.delete({
        where: { id: Number(id) }
      });
    } catch (error) {
      throw new Error(`Failed to delete membership: ${error.message}`);
    }
  },

  async cancelMembership(id, user) {
    try {
      const existingMembership = await prisma.membership.findUnique({
        where: { id: Number(id) },
        include: { client: true }
      });

      if (!existingMembership) {
        throw new Error('Membership not found');
      }

      // Check authorization
      const canCancel = user.role === 'ADMIN' || user.id === existingMembership.client_id;
      if (!canCancel) {
        throw new Error('Unauthorized to cancel this membership');
      }

      return await prisma.membership.update({
        where: { id: Number(id) },
        data: {
          status: 'CANCELLED',
          autoRenewal: false
        },
        include: {
          client: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true
            }
          },
          plan: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to cancel membership: ${error.message}`);
    }
  },

  async renewMembership(id, user) {
    try {
      const existingMembership = await prisma.membership.findUnique({
        where: { id: Number(id) },
        include: { client: true, plan: true }
      });

      if (!existingMembership) {
        throw new Error('Membership not found');
      }

      // Check authorization
      const canRenew = user.role === 'ADMIN' || user.id === existingMembership.client_id;
      if (!canRenew) {
        throw new Error('Unauthorized to renew this membership');
      }

      // Calculate new end date
      const newEndDate = new Date(existingMembership.endDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);

      return await prisma.membership.update({
        where: { id: Number(id) },
        data: {
          endDate: newEndDate,
          status: 'ACTIVE'
        },
        include: {
          client: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true
            }
          },
          plan: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to renew membership: ${error.message}`);
    }
  },

  async getClientMemberships(clientId, user) {
    try {
      // Check authorization
      const canAccess = user.role === 'ADMIN' || user.id === Number(clientId);
      if (!canAccess) {
        throw new Error('Unauthorized to access these memberships');
      }

      return await prisma.membership.findMany({
        where: { client_id: Number(clientId) },
        include: {
          plan: true,
          payments: true,
          discountUsages: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      throw new Error(`Failed to fetch client memberships: ${error.message}`);
    }
  },

  async getActiveClientMembership(clientId, user) {
    try {
      // Check authorization
      const canAccess = user.role === 'ADMIN' || user.id === Number(clientId);
      if (!canAccess) {
        throw new Error('Unauthorized to access this membership');
      }

      return await prisma.membership.findFirst({
        where: { 
          client_id: Number(clientId),
          status: 'ACTIVE',
          endDate: {
            gte: new Date() // End date is in the future
          }
        },
        include: {
          plan: true,
          payments: true,
          discountUsages: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch active client membership: ${error.message}`);
    }
  }
};