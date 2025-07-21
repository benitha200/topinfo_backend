import crypto from 'crypto';
import prisma from './prisma.service.js';
import { emailService } from './email.service.js';
// import { smsService } from './sms.service.js'; // Uncomment when SMS service is available

export const otpService = {
  // Generate a 6-digit OTP
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  },

  // Create and send OTP
  async createAndSendOTP(email, type, userId) {
    try {
      // Validate inputs
      if (!email || email.trim() === '') {
        throw new Error('email (email/phone) is required');
      }

      if (!type || type.trim() === '') {
        throw new Error('OTP type is required');
      }

      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('Creating OTP for:', { email: email.trim(), type, userId });

      // Generate OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Calculate expiry time (10 minutes from now)
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

      // Save OTP to database
      const otp = await prisma.OTP.create({
        data: {
          email: email.trim(),
          code: otpCode,
          type: type.toUpperCase(),
          userId: userId,
          expiresAt: expiryTime,
          isUsed: false,
        },
      });

      console.log('OTP created in database:', otp);

      // Send OTP based on type
      if (type === 'EMAIL_VERIFICATION' || type === 'PASSWORD_RESET' || type === 'LOGIN_VERIFICATION') {
        // Make sure email is a valid email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Invalid email format for email-based OTP');
        }
        
        console.log('Sending email OTP to:', email);
        await emailService.sendOTP(email, otpCode, type);
      } else if (type === 'PHONE_VERIFICATION') {
        // This would be phone-based
        console.log('Sending SMS OTP to:', email);
        // await smsService.sendSMS(email, `Your TopInfo verification code is: ${otpCode}`);
        throw new Error('SMS service not configured yet');
      }

      return {
        success: true,
        message: 'OTP sent successfully',
        otpId: otp.id
      };
    } catch (error) {
      console.error('Error creating and sending OTP:', error);
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
  },

  // Verify OTP
  async verifyOTP(email, code, type) {
    try {
      const otp = await prisma.OTP.findFirst({
        where: {
          email: email.trim(),
          code,
          type: type.toUpperCase(),
          isUsed: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!otp) {
        return {
          success: false,
          message: 'Invalid or expired OTP',
        };
      }

      // Mark OTP as used
      await prisma.OTP.update({
        where: { id: otp.id },
        data: { isUsed: true },
      });

      return {
        success: true,
        message: 'OTP verified successfully',
        otpData: otp,
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw new Error('Failed to verify OTP');
    }
  },

  // Clean up expired OTPs (should be called periodically)
  async cleanupExpiredOTPs() {
    try {
      const result = await prisma.OTP.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      console.log(`Cleaned up ${result.count} expired OTPs`);
      return result;
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
      throw new Error('Failed to cleanup expired OTPs');
    }
  },

  // Resend OTP
  async resendOTP(email, type, userId) {
    try {
      // Check if there's a recent OTP (within 1 minute) to prevent spam
      const recentOTP = await prisma.OTP.findFirst({
        where: {
          email: email.trim(),
          type: type.toUpperCase(),
          createdAt: {
            gt: new Date(Date.now() - 60 * 1000), // 1 minute ago
          },
        },
      });

      if (recentOTP) {
        return {
          success: false,
          message: 'Please wait before requesting another OTP',
        };
      }

      // Create and send new OTP
      return await this.createAndSendOTP(email, type, userId);
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw new Error('Failed to resend OTP');
    }
  },
};