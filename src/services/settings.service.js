import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const settingsService = {
  async createSettings(data) {
    return prisma.settings.create({
      data,
      select: {
        id: true,
        client_price: true,
        provider_price: true,
        support_email: true
      }
    });
  },

  async getSettings() {
    return prisma.settings.findFirst({
      select: {
        id: true,
        client_price: true,
        provider_price: true,
        support_email: true
      }
    });
  },

  async updateSettings(id, data, user) {

    const existingSettings = await prisma.settings.findUnique({
      where: { id: Number(id) }
    });

    if (!existingSettings) {
      throw new Error('Settings not found');
    }

    return prisma.settings.update({
      where: { id: Number(id) },
      data,
      select: {
        id: true,
        client_price: true,
        provider_price: true,
        support_email: true
      }
    });
  }
};