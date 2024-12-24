// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export const settingsService = {
//   async createSettings(data) {
//     return prisma.settings.create({
//       data,
//       select: {
//         id: true,
//         client_price: true,
//         provider_price: true,
//         support_email: true
//       }
//     });
//   },

//   async getSettings() {
//     return prisma.settings.findFirst({
//       select: {
//         id: true,
//         client_price: true,
//         provider_price: true,
//         support_email: true
//       }
//     });
//   },

//   async updateSettings(id, data, user) {

//     const existingSettings = await prisma.settings.findUnique({
//       where: { id: Number(id) }
//     });

//     if (!existingSettings) {
//       throw new Error('Settings not found');
//     }

//     return prisma.settings.update({
//       where: { id: Number(id) },
//       data,
//       select: {
//         id: true,
//         client_price: true,
//         provider_price: true,
//         support_email: true
//       }
//     });
//   }
// };

// settings.service.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const settingsService = {
  async createSettings(data) {
    const { support_email, categoryPrices } = data;
  
    // Create the main settings
    const settings = await prisma.settings.create({
      data: {
        support_email,
        client_price: 2000,
        provider_price: 3000
      }
    });
  
    // Create category-specific settings
    if (categoryPrices && categoryPrices.length > 0) {
      await prisma.$transaction(
        categoryPrices.map(price =>
          prisma.serviceCategory.update({
            where: { id: price.category_id },
            data: {
              client_price: price.client_price,
              provider_price: price.provider_price
            }
          })
        )
      );
    }
  
    return this.getSettings();
  },
  
  async getSettings() {
    // Get or create main settings
    let settings = await prisma.settings.findFirst();
  
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          support_email: 'support@topinfo.rw',
          client_price: 2000,
          provider_price: 3000
        }
      });
    }
  
    // Get category-specific prices with their IDs
    const categories = await prisma.serviceCategory.findMany({
      select: {
        id: true,
        name: true,
        client_price: true,
        provider_price: true
      }
    });
  
    // Combine the data with category IDs
    return {
      ...settings,
      categoryPrices: categories.map(category => ({
        category_id: category.id,
        category_name: category.name,
        client_price: category.client_price ?? settings.client_price,
        provider_price: category.provider_price ?? settings.provider_price
      }))
    };
  },
  
  async updateSettings(data) {
    // Get or create settings
    let settings = await prisma.settings.findFirst();
  
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          support_email: data.support_email,
          client_price: 2000,
          provider_price: 3000
        }
      });
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          support_email: data.support_email
        }
      });
    }
  
    return settings;
  },
  
  async updateCategoryPrices(categoryPrices) {
    if (!categoryPrices || !Array.isArray(categoryPrices)) {
      throw new Error('Invalid category prices data');
    }
  
    // Update all category prices in a transaction, ensuring category IDs are preserved
    const updates = await prisma.$transaction(
      categoryPrices.map(price =>
        prisma.serviceCategory.update({
          where: { id: price.category_id },
          data: {
            client_price: price.client_price,
            provider_price: price.provider_price
          },
          select: {
            id: true,
            name: true,
            client_price: true,
            provider_price: true
          }
        })
      )
    );
  
    return updates.map(category => ({
      category_id: category.id,
      category_name: category.name,
      client_price: category.client_price,
      provider_price: category.provider_price
    }));
  }
};