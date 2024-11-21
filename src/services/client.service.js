import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const clientService = {
  async createClient(data) {
    return prisma.client.create({
      data,
      include: {
        requests: true,
        payments: true
      }
    });
  },

  async getAllClients(user) {
    // Add role-based filtering similar to request service
    const where = user.role === 'ADMIN' 
      ? {} 
      : { id: user.id };

    return prisma.client.findMany({
      where,
      include: {
        requests: {
          include: {
            service_category: true,
            agent: true,
            payments: true
          }
        },
        payments: true
      }
    });
  },

  async getClientById(id) {
    return prisma.client.findUnique({
      where: { id: Number(id) },
      include: {
        requests: {
          include: {
            service_category: true,
            agent: true,
            payments: true
          }
        },
        payments: true
      }
    });
  },

  async updateClient(id, data, user) {
    // Access control
    const existingClient = await prisma.client.findUnique({
      where: { id: Number(id) }
    });

    if (!existingClient) {
      throw new Error('Client not found');
    }

    // Validate update permissions
    const canUpdate = 
      user.role === 'ADMIN' || 
      user.id === existingClient.id;

    if (!canUpdate) {
      throw new Error('Unauthorized to update this client');
    }

    return prisma.client.update({
      where: { id: Number(id) },
      data,
      include: {
        requests: {
          include: {
            service_category: true,
            agent: true,
            payments: true
          }
        },
        payments: true
      }
    });
  },

  async deleteClient(id, user) {
    // Access control
    const existingClient = await prisma.client.findUnique({
      where: { id: Number(id) }
    });

    if (!existingClient) {
      throw new Error('Client not found');
    }

    // Only allow deletion by self or admin
    const canDelete = 
      user.role === 'ADMIN' || 
      user.id === existingClient.id;

    if (!canDelete) {
      throw new Error('Unauthorized to delete this client');
    }

    return prisma.client.delete({
      where: { id: Number(id) }
    });
  }
};