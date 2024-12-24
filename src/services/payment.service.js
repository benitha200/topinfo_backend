import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const paymentService = {
  // async createPayment(data) {
  //   return prisma.payment.create({
  //     data,
  //     include: {
  //       request: true,
  //       client: true
  //     }
  //   });
  // },

async createPayment(paymentData) {
    try {
      const payment = await prisma.payment.create({
        data: {
          amount: paymentData.amount,
          phone_number: paymentData.phone,
          transaction_id: paymentData.transactionId,
          request_transaction_id: paymentData.requestTransactionId,
          status: "PENDING",
          request: {
            connect: {
              id: paymentData.requestId
            }
          },
          // If you need to connect to a client, you'll also need:
          client: {
            connect: {
              id: paymentData.clientId // You'll need to pass this in your request
            }
          }
        }
      });
      return payment;
    } catch (error) {
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  },

  // async getAllPayments(user) {
  //   const where = user.role === 'ADMIN'
  //     ? {}
  //     : { client_id: user.id };

  //   return prisma.payment.findMany({
  //     where,
  //     include: {
  //       request: {
  //         include: {
  //           service_category: true,
  //           agent: true
  //         }
  //       },
  //       client: true
  //     }
  //   });
  // },

  async getAllPayments(user) {
    try {
      const where = user.role === 'ADMIN'
        ? {}
        : { 
            OR: [
              { client_id: user.id },
              { client: { id: user.id } }
            ]
          };
  
      return prisma.payment.findMany({
        where,
        include: {
          request: {
            include: {
              service_category: true,
              agent: true,
              client: true
            }
          },
          client: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }
  },
  async getPaymentById(id) {
    return prisma.payment.findUnique({
      where: { id: Number(id) },
      include: {
        request: {
          include: {
            service_category: true,
            agent: true
          }
        },
        client: true
      }
    });
  },

  async updatePayment(id, data, user) {
    const existingPayment = await prisma.payment.findUnique({
      where: { id: Number(id) },
      include: { client: true }
    });

    if (!existingPayment) {
      throw new Error('Payment not found');
    }

    // Only allow updates by admin or the client who owns the payment
    const canUpdate = 
      user.role === 'ADMIN' ||
      user.id === existingPayment.client_id;

    if (!canUpdate) {
      throw new Error('Unauthorized to update this payment');
    }

    return prisma.payment.update({
      where: { id: Number(id) },
      data,
      include: {
        request: {
          include: {
            service_category: true,
            agent: true
          }
        },
        client: true
      }
    });
  },

  async deletePayment(id, user) {
    const existingPayment = await prisma.payment.findUnique({
      where: { id: Number(id) },
      include: { client: true }
    });

    if (!existingPayment) {
      throw new Error('Payment not found');
    }

    // Only allow deletion by admin or the client who owns the payment
    const canDelete = 
      user.role === 'ADMIN' ||
      user.id === existingPayment.client_id;

    if (!canDelete) {
      throw new Error('Unauthorized to delete this payment');
    }

    return prisma.payment.delete({
      where: { id: Number(id) }
    });
  },

  async processPayment(paymentData) {
    try {
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Payment processing error: ${error.message}`);
    }
  },

  async checkPaymentStatus(transactionId, requestTransactionId) {
    try {
      const response = await fetch('/api/check-payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId,
          requestTransactionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Payment status check error: ${error.message}`);
    }
  }
};