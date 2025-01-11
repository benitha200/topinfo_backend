import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { sendServiceProvider } from "./email.service.js";

const prisma = new PrismaClient();

export const itechService = {
  async initiatePayment(paymentData) {
    const { phone, amount } = paymentData;

    try {
      const payload = {
        amount: amount,
        phone: phone,
        key: ["078", "079"].some((prefix) => phone.startsWith(prefix))
          ? process.env.ITECPAY_KEY_MOMO
          : process.env.ITECPAY_KEY_AIRTEL,
      };

      const response = await axios.post(
        "https://pay.itecpay.rw/api/pay",
        payload
      );

      return {
        success: true,
        status: response.data.status,
        message: response.data.data.message
      };
    } catch (error) {
      console.error("Payment initiation error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Payment initiation failed",
      };
    }
  },
};
