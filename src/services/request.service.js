import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const requestService = {
  async createRequest(data) {
    return prisma.request.create({ 
      data,
      include: { 
        client: true, 
        service_category: true 
      } 
    });
  },

  async getAllRequests(user) {
    const where = user.role === 'ADMIN' ? {} : 
      user.role === 'SERVICE_SEEKER' ? { client_id: user.id } :
      user.role === 'AGENT' ? { agent_id: user.id } : {};

    return prisma.request.findMany({
      where,
      include: { 
        client: true, 
        service_category: true,
        agent: true,
        payments: true
      }
    });
  },

  async getRequestById(id) {
    return prisma.request.findUnique({
      where: { id: Number(id) },
      include: { 
        client: true, 
        service_category: true,
        agent: true,
        payments: true
      }
    });
  },

  async updateRequest(id, data, user) {
    // Access control
    const existingRequest = await prisma.request.findUnique({
      where: { id: Number(id) }
    });

    if (!existingRequest) {
      throw new Error('Request not found');
    }

    // Validate update permissions
    const canUpdate = 
      user.role === 'ADMIN' || 
      user.id === existingRequest.client_id || 
      user.id === existingRequest.agent_id;

    if (!canUpdate) {
      throw new Error('Unauthorized to update this request');
    }

    return prisma.request.update({
      where: { id: Number(id) },
      data,
      include: { 
        client: true, 
        service_category: true,
        agent: true
      }
    });
  },

  async deleteRequest(id, user) {
    // Access control
    const existingRequest = await prisma.request.findUnique({
      where: { id: Number(id) }
    });

    if (!existingRequest) {
      throw new Error('Request not found');
    }

    // Only allow deletion by client or admin
    const canDelete = 
      user.role === 'ADMIN' || 
      user.id === existingRequest.client_id;

    if (!canDelete) {
      throw new Error('Unauthorized to delete this request');
    }

    return prisma.request.delete({
      where: { id: Number(id) }
    });
  },

  async assignAgent(requestId, agentId) {
    return prisma.request.update({
      where: { id: Number(requestId) },
      data: { 
        agent_id: agentId,
        status: 'ACCEPTED'
      },
      include: { 
        client: true, 
        service_category: true,
        agent: true
      }
    });
  },

  async changeRequestStatus(requestId, status, user) {
    // Validate status change permissions
    const existingRequest = await prisma.request.findUnique({
      where: { id: Number(requestId) }
    });

    if (!existingRequest) {
      throw new Error('Request not found');
    }

    const canChangeStatus = 
      user.role === 'ADMIN' || 
      user.id === existingRequest.agent_id;

    if (!canChangeStatus) {
      throw new Error('Unauthorized to change request status');
    }

    return prisma.request.update({
      where: { id: Number(requestId) },
      data: { status },
      include: { 
        client: true, 
        service_category: true,
        agent: true
      }
    });
  }
};