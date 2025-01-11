// import { PrismaClient } from "@prisma/client";
// import axios from "axios";
// import { sendServiceProvider } from "./email.service.js";

// const prisma = new PrismaClient();

// export const afterPayment = {
//   async successPayment(data) {
//     if (data.type === "client") {
//       return await this.clientVerify(data);
//     } else {
//       return await this.providerVerify(data.providerID);
//     }
//   },

//   async providerVerify(providerID) {
//     const currentDate = new Date();
//     const transaction_id = `MC-${currentDate.getTime()}`;
//     try {
//       await prisma.serviceProvider.update({
//         where: { id: providerID },
//         data: { status: "COMPLETED", transaction_id },
//       });

//       return {
//         success: true,
//         message: "Successfully done",
//       };
//     } catch (error) {
//       console.error("Status check error:", error);
//       throw new Error(`Status check failed: ${error.message}`);
//     }
//   },
//   async clientVerify(data) {
//     const { paymentId, service_location } = data;
//     const payment = await prisma.payment.findUnique({
//       where: { id: paymentId },
//       include: {
//         request: true,
//         client: true,
//       },
//     });

//     if (!payment) {
//       throw new Error(`Payment with ID ${paymentId} not found.`);
//     }

//     const updatedPayment = await prisma.payment.update({
//       where: { id: paymentId },
//       data: { status: "COMPLETED" },
//     });

//     const updatedRequest = await prisma.request.update({
//       where: { id: updatedPayment.requestId },
//       data: { status: "COMPLETED", service_location },
//     });

//     try {
//       await sendServiceProvider({
//         email: payment.client.email,
//         firstname: payment.client.firstname,
//         requestId: payment.requestId,
//         phone: payment.client.phone,
//       });
//     } catch (emailError) {
//       console.error("Failed to send welcome email:", emailError);
//     }

//     return {
//       success: true,
//       message: "Successfully done",
//     };
//   },
// };

import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { sendServiceProvider } from "./email.service.js";

const prisma = new PrismaClient();

export const afterPayment = {
  async successPayment(data) {
    try {
      if (data.type === "client") {
        return await this.clientVerify(data);
      } else {
        return await this.providerVerify(data.providerID);
      }
    } catch (error) {
      // Handle any errors in the verification process
      console.error("Payment verification error:", error);
      if (data.type === "client" && data.paymentId) {
        await this.markPaymentAsFailed(data.paymentId);
      } else if (data.providerID) {
        await this.markProviderAsFailed(data.providerID);
      }
      throw error;
    }
  },

  async markPaymentAsFailed(paymentId) {
    try {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "FAILED" },
      });

      if (payment.requestId) {
        await prisma.request.update({
          where: { id: payment.requestId },
          data: { status: "FAILED" },
        });
      }
    } catch (error) {
      console.error("Error marking payment as failed:", error);
    }
  },

  async markProviderAsFailed(providerID) {
    try {
      await prisma.serviceProvider.update({
        where: { id: providerID },
        data: { status: "FAILED" },
      });
    } catch (error) {
      console.error("Error marking provider as failed:", error);
    }
  },

  async providerVerify(providerID) {
    const currentDate = new Date();
    const transaction_id = `MC-${currentDate.getTime()}`;
    try {
      await prisma.serviceProvider.update({
        where: { id: providerID },
        data: { status: "COMPLETED", transaction_id },
      });

      return {
        success: true,
        message: "Successfully done",
      };
    } catch (error) {
      console.error("Status check error:", error);
      await this.markProviderAsFailed(providerID);
      throw new Error(`Status check failed: ${error.message}`);
    }
  },

  async clientVerify(data) {
    const { paymentId, service_location } = data;
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          request: true,
          client: true,
        },
      });

      if (!payment) {
        throw new Error(`Payment with ID ${paymentId} not found.`);
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "COMPLETED" },
      });

      const updatedRequest = await prisma.request.update({
        where: { id: updatedPayment.requestId },
        data: { status: "COMPLETED", service_location },
      });

      try {
        await sendServiceProvider({
          email: payment.client.email,
          firstname: payment.client.firstname,
          requestId: payment.requestId,
          phone: payment.client.phone,
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't mark as failed just because email failed
      }

      return {
        success: true,
        message: "Successfully done",
      };
    } catch (error) {
      console.error("Client verification error:", error);
      await this.markPaymentAsFailed(paymentId);
      throw error;
    }
  },
};