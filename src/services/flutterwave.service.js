import { PrismaClient } from "@prisma/client";
import Flutterwave from "flutterwave-node-v3";
import { sendServiceProvider } from "./email.service.js";
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

const prisma = new PrismaClient();

export const flutterwaveService = {
  async initiatePayment(paymentData) {
    const { name, email, phone, amount, requestId, clientId, currentUrl } =
      paymentData;
    const currentDate = new Date();
    const txRef = `MC-${currentDate.getTime()}`;
    const orderId = `USS_URG_${currentDate.getTime()}`;
    try {
      const payload = {
        tx_ref: txRef,
        order_id: orderId,
        amount,
        currency: "RWF",
        email,
        phone_number: phone,
        fullname: name,
        redirect_url: currentUrl,
      };

      console.log("payload of payment");
      console.log(payload);

      const response = await flw.MobileMoney.rwanda(payload);

      await prisma.payment.create({
        data: {
          amount: parseFloat(amount),
          phone_number: payload.phone_number,
          transaction_id: txRef,
          request_transaction_id: orderId,
          status: "PENDING",
          request: {
            connect: {
              id: requestId,
            },
          },
          client: {
            connect: {
              id: clientId,
            },
          },
        },
        include: {
          request: true,
          client: true,
        },
      });

      return {
        success: true,
        response,
      };
    } catch (error) {
      console.log(error);
      throw new Error(`Payment initiation failed: ${error}`);
    }
  },

  async callback(tx_ref) {
    try {
      console.log("Received callback for tx_ref", tx_ref);
      const payment = await prisma.payment.findUnique({
        where: { transaction_id: tx_ref },
        include: {
          client: true,
          request: true,
        },
      });

      if (!payment) {
        return {
          success: false,
          message: "Payment not found",
        };
      }

      await prisma.payment.update({
        where: { transaction_id: tx_ref },
        data: { status: "COMPLETED" },
      });

      await prisma.request.update({
        where: { id: payment.requestId },
        data: { status: "COMPLETED", updatedAt: new Date() },
      });
      try {
        console.log("Here is the payment");
        console.log(payment)
        await sendServiceProvider({
          email: payment.client.email,
          firstname: payment.client.firstname,
          requestId:payment.requestId,
          phone: payment.client.phone
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      return {
        success: true,
        message: "Successfully done",
      };
    } catch (error) {
      console.error("Status check error:", error);
      throw new Error(`Status check failed: ${error.message}`);
    }
  },
  async providerInitiatePayment(paymentData) {
    const { name, email, phone, amount, providerID, currentUrl } = paymentData;
    const currentDate = new Date();
    const txRef = `MC-${currentDate.getTime()}`;
    const orderId = `USS_URG_${currentDate.getTime()}`;
    try {
      const payload = {
        tx_ref: txRef,
        order_id: orderId,
        amount,
        currency: "RWF",
        email,
        phone_number: phone,
        fullname: name,
        redirect_url: currentUrl,
      };

      const response = await flw.MobileMoney.rwanda(payload);
      await prisma.serviceProvider.update({
        where: { id: providerID },
        data: { status: "IN_PROGRESS", transaction_id: txRef },
      });

      return {
        success: true,
        response,
      };
    } catch (error) {
      console.log(error);
      throw new Error(`Payment initiation failed: ${error}`);
    }
  },

  async providerCallback(tx_ref) {
    try {

      await prisma.serviceProvider.update({
        where: { transaction_id: tx_ref },
        data: { status: "COMPLETED" },
      });

      return {
        success: true,
        message: "Successfully done",
      };
    } catch (error) {
      console.error("Status check error:", error);
      throw new Error(`Status check failed: ${error.message}`);
    }
  },
};
