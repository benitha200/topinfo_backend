import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { sendServiceProvider } from "./email.service.js";

const prisma = new PrismaClient();

export const itechService = {
    async initiatePayment(paymentData) {
      const { name, email, phone, amount, requestId, clientId, currentUrl } = paymentData;
      const currentDate = new Date();
      const txRef = `MC-${currentDate.getTime()}`;
      const orderId = `USS_URG_${currentDate.getTime()}`;
  
      try {
        const payload = {
            amount: amount,
            phone: phone,
            key: ["078", "079"].some(prefix => phone.startsWith(prefix)) 
              ? process.env.ITECPAY_KEY_MOMO 
              : process.env.ITECPAY_KEY_AIRTEL
          };
  
        console.log("Payload of payment:", payload);
  
        const response = await axios.post("https://pay.itecpay.rw/api/pay", payload);
  
        // Determine payment status based on the response
        const paymentStatus = response.data.success ? "COMPLETED" : "FAILED";
  
        // Create payment record with determined status
        const paymentRecord = await prisma.$transaction(async (prisma) => {
          // Create payment record
          const payment = await prisma.payment.create({
            data: {
              amount: parseFloat(amount),
              phone_number: payload.phone,
              transaction_id: txRef,
              request_transaction_id: orderId,
              status: paymentStatus,
              client_id: clientId,
              requestId: requestId,
              // Remove response_data field
            },
            include: {
              request: true,
              client: true,
            },
          });
  
          // Update request status based on payment status
          await prisma.request.update({
            where: { id: requestId },
            data: {
              status: paymentStatus === "COMPLETED" ? "COMPLETED" : "FAILED",
              updatedAt: new Date()
            },
          });
  
          // Send email if payment is successful
          if (paymentStatus === "COMPLETED") {
            try {
              await sendServiceProvider({
                email: payment.client.email,
                firstname: payment.client.firstname,
                requestId: payment.requestId,
                phone: payment.client.phone,
              });
            } catch (emailError) {
              console.error("Failed to send welcome email:", emailError);
            }
          }
  
          return payment;
        });
  
        // Prepare response
        return {
          success: paymentStatus === "COMPLETED",
          message: response.data.message || (paymentStatus === "COMPLETED" ? 'Payment successful' : 'Payment failed'),
          transactionId: txRef,
          responseData: response.data,
        };
      } catch (error) {
        console.error("Payment initiation error:", error);
  
        // Create a payment record with FAILED status in case of exception
        try {
          await prisma.payment.create({
            data: {
              amount: parseFloat(amount),
              phone_number: "0785283918",
              transaction_id: txRef,
              request_transaction_id: orderId,
              status: "FAILED",
              client_id: clientId,
              requestId: requestId,
              // Remove error_data field
            },
          });
  
          // Update request status to FAILED
          await prisma.request.update({
            where: { id: requestId },
            data: {
              status: "FAILED",
              updatedAt: new Date()
            },
          });
        } catch (dbError) {
          console.error("Failed to create failed payment record:", dbError);
        }
  
        return {
          success: false,
          message: error.response?.data?.message || error.message || 'Payment initiation failed',
        };
      }
    },
  };