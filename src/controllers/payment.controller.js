import { paymentService } from "../services/payment.service.js";
import { intouchService } from "../services/intouch.service.js";
import { PrismaClient } from "@prisma/client";
import { flutterwaveService } from "../services/flutterwave.service.js";
import { itechService } from "../services/itechService.js";
import { afterPayment } from "../services/afterPayment.service.js";

const prisma = new PrismaClient();

export const paymentController = {
  // async initiatePayment(req, res) {
  //     try {
  //       const { phone, amount, description, requestId } = req.body;

  //       // Get the request to find the associated client
  //       const request = await prisma.request.findUnique({
  //         where: { id: requestId },
  //         select: { client_id: true }
  //       });

  //       if (!request) {
  //         return res.status(404).json({
  //           success: false,
  //           message: "Request not found"
  //         });
  //       }

  //       const paymentData = {
  //         phone,
  //         amount: parseFloat(amount),
  //         description,
  //         requestId,
  //         clientId: request.client_id
  //       };

  //       const result = await intouchService.initiatePayment(paymentData);
  //       res.json(result);
  //     } catch (error) {
  //       res.status(500).json({
  //         success: false,
  //         message: error.message
  //       });
  //     }
  //   },

  async webhookcallback(req, res) {
    res.json("Here ");
  },

  // async initiatePayment(req, res) {
  //   try {
  //     const { service_location, request_id, paymentNumber, currentUrl } =
  //       req.body;

  //     // Validate input
  //     if (!request_id) {
  //       res.status(400).json({
  //         success: false,
  //         message: "Request ID is required",
  //       });
  //     }
  //     const request = await prisma.request.findUnique({
  //       where: { id: request_id },
  //       select: {
  //         id: true,
  //         client_id: true,
  //         service_category_id: true,
  //         client: {
  //           select: {
  //             id: true,
  //             firstname: true,
  //             email: true,
  //             phone: true,
  //           },
  //         },
  //         service_category: {
  //           select: {
  //             id: true,
  //             // client_price: true,
  //           },
  //         },
  //       },
  //     });

  //     // Check if request exists
  //     if (!request) {
  //       res.status(404).json({
  //         success: false,
  //         message: "Request not found",
  //       });
  //     }

  //     // Ensure client exists
  //     if (!request.client) {
  //       res.status(400).json({
  //         success: false,
  //         message: "No client associated with this request",
  //       });
  //     }

  //     const paymentData = {
  //       name: request.client.firstname,
  //       email: request.client.email,
  //       phone: paymentNumber,
  //       // amount: parseFloat(request.service_category.client_price),
  //       amount: parseFloat("100"),
  //       requestId: request.id,
  //       clientId: request.client.id,
  //       currentUrl,
  //     };

  //     console.log(paymentData);

  //     // Initiate payment
  //     // // const result = await intouchService.initiatePayment(paymentData);
  //     // const result = await flutterwaveService.initiatePayment(paymentData);
  //     const result=await itechService.initiatePayment(paymentData)

  //     // // Check if result exists and has a success status
  //     if (!result || !result.success) {
  //       return res.status(400).json({
  //         success: false,
  //         message: result?.message || "Payment initiation failed",
  //       });
  //     }

  //     // // Update request status if payment initiation is successful
  //     await prisma.request.update({
  //       where: { id: request.id },
  //       data: { status: "IN_PROGRESS", service_location: service_location },
  //     });

  //     res.json({ response: result.response });
  //   } catch (error) {
  //     console.error("Full Payment Initiation Error:", error);
  //     res.status(500).json({
  //       success: false,
  //       message: error.message,
  //       errorStack: error.stack,
  //     });
  //   }
  // },

  async initiatePayment(req, res) {
    try {
      const {
        service_location,
        request_id,
        client_id,
        paymentNumber,
        type,
        providerID,
      } = req.body;
      let requestDate = {};
      if (type === "client") {
        const setting = await prisma.settings.findFirst({
          select: { client_price: true },
        });

        const amount = parseFloat(setting.client_price);
        const currentDate = new Date();
        const txRef = `MC-${currentDate.getTime()}`;
        const orderId = `USS_URG_${currentDate.getTime()}`;

        const payment = await prisma.payment.create({
          data: {
            requestId: request_id,
            amount,
            phone_number: paymentNumber,
            transaction_id: txRef,
            request_transaction_id: orderId,
            client_id,
          },
        });

        requestDate = {
          paymentId: payment.id,
          service_location,
          amount,
          type,
        };
      } else {
        const provider = await prisma.serviceProvider.findUnique({
          where: { id: providerID },
          select: { total_district_cost: true },
        });

        requestDate = {
          providerID,
          amount: parseFloat(provider.total_district_cost),
          type,
        };
      }

      // Initiate payment
      const result = await itechService.initiatePayment({
        phone: paymentNumber,
        amount: requestDate.amount,
      });

      if (result.success && result.status === 200) {
      const response = await afterPayment.successPayment(requestDate);
      res.json({
        success: true,
        response,
      });
      } else {
        res.json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Full Payment Initiation Error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // try {
    //   const { service_location, request_id, paymentNumber, type } = req.body;

    //   // Validate input
    //   if (!request_id) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Request ID is required",
    //     });
    //   }

    //   const request = await prisma.request.findUnique({
    //     where: { id: request_id },
    //     select: {
    //       id: true,
    //       client_id: true,
    //       service_category_id: true,
    //       client: {
    //         select: {
    //           id: true,
    //           firstname: true,
    //           email: true,
    //           phone: true,
    //         },
    //       },
    //       service_category: {
    //         select: {
    //           id: true,
    //         },
    //       },
    //     },
    //   });

    //   // Check if request exists
    //   if (!request) {
    //     return res.status(404).json({
    //       success: false,
    //       message: "Request not found",
    //     });
    //   }

    //   // // Ensure client exists
    //   if (!request.client) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "No client associated with this request",
    //     });
    //   }

    //   const paymentData = {
    //     phone: paymentNumber,
    //     amount: parseFloat("100"),
    //   };

    //   // // Initiate payment
    //   const result = await itechService.initiatePayment(paymentData);

    //   if (result.success && result.status === 200) {
    //     res.json({ message: "Successfully payed", result , statusType: typeof result.status });
    //   } else {
    //     res.json({ message: result.message });
    //   }

    //   // // Check if result exists and has a success status
    //   // if (!result || !result.success) {
    //   //   return res.status(400).json({
    //   //     success: false,
    //   //     message: result?.message || "Payment initiation failed",
    //   //   });
    //   // }

    //   // // Update request status if payment initiation is successful
    //   // await prisma.request.update({
    //   //   where: { id: request.id },
    //   //   data: { status: "IN_PROGRESS", service_location: service_location },
    //   // });

    //   // // Safely send only the necessary response data
    //   // res.json({
    //   //   success: true,
    //   //   response: {
    //   //     // Extract only the necessary fields from the result
    //   //     message: result.message,
    //   //     // Add any other relevant fields
    //   //   }
    //   // });
    // } catch (error) {
    //   console.error("Full Payment Initiation Error:", error);
    //   res.status(500).json({
    //     success: false,
    //     message: error.message,
    //   });
    // }
  },

  async paymentCallback(req, res) {
    try {
      const { tx_ref } = req.body;

      const result = await flutterwaveService.callback(tx_ref);

      if (!result || !result.success) {
        return res.status(400).json({
          success: false,
          message: result?.message || "Not completed",
        });
      }
      res
        .status(200)
        .json({ message: "Payment and request updated successfully." });
    } catch (error) {
      console.error("Full Payment Initiation Error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
        errorStack: error.stack,
      });
    }
  },

  async providerInitiatePayment(req, res) {
    try {
      const { providerID, paymentNumber, currentUrl } = req.body;

      // Validate input
      if (!providerID) {
        res.status(400).json({
          success: false,
          message: "provider ID is required",
        });
      }
      const provider = await prisma.serviceProvider.findUnique({
        where: { id: providerID },
        select: {
          id: true,
          firstname: true,
          email: true,
          total_district_cost: true,
        },
      });

      // Check if provider exists
      if (!provider) {
        res.status(404).json({
          success: false,
          message: "Provider not found",
        });
      }

      const paymentData = {
        name: provider.firstname,
        email: provider.email,
        phone: paymentNumber,
        amount: parseFloat(provider.total_district_cost),
        providerID,
        currentUrl,
      };

      const result = await flutterwaveService.providerInitiatePayment(
        paymentData
      );

      // // Check if result exists and has a success status
      if (!result || !result.success) {
        return res.status(400).json({
          success: false,
          message: result?.message || "Payment initiation failed",
        });
      }

      res.json({ response: result.response });
    } catch (error) {
      console.error("Full Payment Initiation Error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
        errorStack: error.stack,
      });
    }
  },
  async providerPaymentCallback(req, res) {
    try {
      const { tx_ref } = req.body;

      const result = await flutterwaveService.providerCallback(tx_ref);

      if (!result || !result.success) {
        return res.status(400).json({
          success: false,
          message: result?.message || "Not completed",
        });
      }
      res.status(200).json({ message: "Payment updated successfully." });
    } catch (error) {
      console.error("Full Payment Initiation Error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
        errorStack: error.stack,
      });
    }
  },

  async createPayment(req, res, next) {
    try {
      const payment = await paymentService.createPayment({
        ...req.body,
      });
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  },

  async getAllPayments(req, res, next) {
    try {
      const payments = await paymentService.getAllPayments(req.user);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  },

  async getPaymentById(req, res, next) {
    try {
      const payment = await paymentService.getPaymentById(req.params.id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      next(error);
    }
  },

  async updatePayment(req, res, next) {
    try {
      const payment = await paymentService.updatePayment(
        req.params.id,
        req.body,
        req.user
      );
      res.json(payment);
    } catch (error) {
      next(error);
    }
  },

  async deletePayment(req, res, next) {
    try {
      await paymentService.deletePayment(req.params.id, req.user);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async processPayment(req, res, next) {
    try {
      const result = await paymentService.processPayment(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // async checkPaymentStatus(req, res) {
  //   try {
  //     const { transactionId, requestTransactionId } = req.body;
  //     const result = await intouchService.checkPaymentStatus(
  //       transactionId,
  //       requestTransactionId
  //     );
  //     res.json(result);
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: error.message
  //     });
  //   }
  // }

  // async checkPaymentStatus(req, res) {
  //   const prisma = new PrismaClient();
  //   const transaction = await prisma.$transaction(async (tx) => {
  //     try {
  //       const { transactionId, requestTransactionId } = req.body;
  //       const result = await intouchService.checkPaymentStatus(
  //         transactionId,
  //         requestTransactionId
  //       );

  //       // If payment is successful or failed, update the associated request
  //       if (result.status === 'SUCCESSFULL' || result.status === 'FAILED') {
  //         const payment = await tx.payment.findFirst({
  //           where: { request_transaction_id: requestTransactionId },
  //           include: { request: true }
  //         });

  //         if (payment && payment.request) {
  //           await tx.request.update({
  //             where: { id: payment.request.id },
  //             data: {
  //               status: result.status === 'SUCCESSFULL' ? 'COMPLETED' : 'CANCELLED'
  //             }
  //           });
  //         }
  //       }

  //       res.json(result);
  //     } catch (error) {
  //       console.error('Payment status check error:', error);
  //       res.status(500).json({
  //         success: false,
  //         message: error.message
  //       });
  //     }
  //   });
  // }

  async checkPaymentStatus(req, res) {
    const prisma = new PrismaClient();

    try {
      const { transactionId, requestTransactionId } = req.body;

      // First, check payment status via external service
      const result = await intouchService.checkPaymentStatus(
        transactionId,
        requestTransactionId
      );

      // Find the associated payment and request
      const payment = await prisma.payment.findFirst({
        where: { request_transaction_id: requestTransactionId },
        include: { request: true },
      });

      // Update request status if payment is successful or failed
      if (
        payment &&
        payment.request &&
        (result.status === "SUCCESSFULL" || result.status === "FAILED")
      ) {
        await prisma.request.update({
          where: { id: payment.request.id },
          data: {
            status: result.status === "SUCCESSFULL" ? "COMPLETED" : "CANCELLED",
          },
        });
      }

      res.json(result);
    } catch (error) {
      console.error("Payment status check error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
