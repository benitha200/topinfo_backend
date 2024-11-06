import prisma from './prisma.service.js';

export const serviceService = {
  getAllServices() {
    return prisma.service.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  getServiceById(id) {
    return prisma.service.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  createService(serviceData) {
    return prisma.service.create({
      data: serviceData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  updateService(id, serviceData) {
    return prisma.service.update({
      where: { id: Number(id) },
      data: serviceData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },
};