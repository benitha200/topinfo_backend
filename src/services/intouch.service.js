import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INTOUCH_CONFIG = {
  username: process.env.INTOUCH_USERNAME || "testa",
  password: process.env.INTOUCH_PASSWORD || "e5d96a680907dac57b36e0d5e74c528733d5a6f61a8c4bfaf23f04505d8572c4",
  timestamp: process.env.INTOUCH_TIMESTAMP || "20220314173905",
  baseUrl: process.env.INTOUCH_API_URL || 'https://www.intouchpay.co.rw/api'
};

export const intouchService = {
  async initiatePayment(data) {
    const { phone, amount, description, requestId, clientId } = data;

    // Generate a unique request transaction ID
    const requestTransactionId = Date.now().toString();

    // Format payload according to API requirements
    const payload = {
      username: INTOUCH_CONFIG.username,
      timestamp: INTOUCH_CONFIG.timestamp,
      amount: Number(amount),
      password: INTOUCH_CONFIG.password,
      mobilephone: phone.startsWith('250') ? phone : `250${phone}`, // Ensure phone number has country code
      requesttransactionid: requestTransactionId,
      transactiontype: 'debit'
    };

    try {
      const response = await fetch(`${INTOUCH_CONFIG.baseUrl}/requestpayment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Payment initiation failed');
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || 'Payment initiation failed');
      }

      // Store payment transaction in database with proper request connection
      const paymentTransaction = await prisma.payment.create({
        data: {
          amount:100,
          phone_number: payload.mobilephone,
          transaction_id: responseData.transactionid || null,
          request_transaction_id: requestTransactionId,
          status: 'PENDING',
        //   payment_method: payload.mobilephone.startsWith('25078') ? 'momo' : 'airtel',
          request: {
            connect: {
              id: requestId
            }
          },
          client: {
            connect: {
              id: clientId
            }
          }
        },
        include: {
          request: true,
          client: true
        }
      });

      return {
        success: true,
        paymentId: paymentTransaction.id,
        transactionId: responseData.transactionid || null,
        requestTransactionId: requestTransactionId,
        message: responseData.message || 'Payment initiated successfully'
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw new Error(`Payment initiation failed: ${error.message}`);
    }
  },

  async checkPaymentStatus(transactionId, requestTransactionId) {
    try {
      const payload = {
        username: INTOUCH_CONFIG.username,
        timestamp: INTOUCH_CONFIG.timestamp,
        password: INTOUCH_CONFIG.password,
        transactionid: transactionId,
        requesttransactionid: requestTransactionId
      };

      const response = await fetch(`${INTOUCH_CONFIG.baseUrl}/gettransactionstatus/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Status check failed');
      }

      const responseData = await response.json();

      // Update payment status in database
      await prisma.payment.updateMany({
        where: {
          request_transaction_id: requestTransactionId
        },
        data: {
          status: responseData.status || 'FAILED',
          transaction_id: responseData.transactionid || null,
          updated_at: new Date()
        }
      });

      return {
        success: true,
        status: responseData.status || 'FAILED',
        message: responseData.message,
        transactionId: responseData.transactionid
      };
    } catch (error) {
      console.error('Status check error:', error);
      throw new Error(`Status check failed: ${error.message}`);
    }
  }
};