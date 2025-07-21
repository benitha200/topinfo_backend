// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import config from "../config/config.js";
// import prisma from "./prisma.service.js";
// import { smsService } from "./sms.service.js";

// export const authService = {
//   async register(userData) {
//     // Check if phone number already exists
//     const existingUserByPhone = await prisma.user.findUnique({
//       where: { phone: userData.phone }
//     });

//     if (existingUserByPhone) {
//       throw new Error("Phone number already registered");
//     }

//     // Use phone number as initial password
//     const initialPassword = userData.phone;
//     const hashedPassword = await bcrypt.hash(
//       initialPassword,
//       config.bcryptSaltRounds
//     );

//     const user = await prisma.user.create({
//       data: {
//         ...userData,
//         password: hashedPassword,
//         role: userData.role || "AGENT",
//       },
//     });

//     const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
//       expiresIn: config.jwt.expiresIn,
//     });

//     // Send welcome SMS
//     try {
//       const welcomeMessage = `Welcome to TopInfo! Your account has been created successfully. Visit topinfo.rw to login using your phone number ${userData.phone} as both username and password. Please change your password after first login.`;

//       await smsService.sendSMS(userData.phone, welcomeMessage);
//     } catch (smsError) {
//       console.error("Failed to send welcome SMS:", smsError);
//     }

//     const userWithoutPassword = { ...user };
//     delete userWithoutPassword.password;
//     return { user: userWithoutPassword, token };
//   },

//   async login(phone, password) {
//     const user = await prisma.user.findUnique({
//       where: { phone },
//     });

//     if (!user) {
//       throw new Error("Invalid phone number or password");
//     }

//     if (!user.isActive) {
//       throw new Error("Account is deactivated. Please contact support.");
//     }

//     const isValidPassword = await bcrypt.compare(password, user.password);

//     if (!isValidPassword) {
//       throw new Error("Invalid phone number or password");
//     }

//     const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
//       expiresIn: config.jwt.expiresIn,
//     });

//     const userWithoutPassword = { ...user };
//     delete userWithoutPassword.password;
//     return { user: userWithoutPassword, token };
//   },

//   async resetPassword(userId, newPassword) {
//     const hashedPassword = await bcrypt.hash(
//       newPassword,
//       config.bcryptSaltRounds
//     );

//     const user = await prisma.user.update({
//       where: { id: userId },
//       data: { password: hashedPassword },
//     });

//     // Send password change confirmation SMS
//     try {
//       const confirmationMessage = `Your TopInfo password has been changed successfully. If you didn't make this change, please contact support immediately.`;
//       await smsService.sendSMS(user.phone, confirmationMessage);
//     } catch (smsError) {
//       console.error("Failed to send password reset confirmation SMS:", smsError);
//     }

//     const userWithoutPassword = { ...user };
//     delete userWithoutPassword.password;
//     return userWithoutPassword;
//   },

//   async forgetPassword(phone) {
//     const user = await prisma.user.findUnique({
//       where: { phone },
//     });

//     if (!user) {
//       throw new Error("User not found");
//     }

//     // Generate a temporary password
//     const temporaryPassword = Math.random().toString(36).slice(-8);
//     const hashedPassword = await bcrypt.hash(
//       temporaryPassword,
//       config.bcryptSaltRounds
//     );

//     // Update user's password
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { password: hashedPassword },
//     });

//     // Send temporary password via SMS
//     try {
//       const resetMessage = `Your temporary TopInfo password is: ${temporaryPassword}. Please login at topinfo.rw and change your password immediately.`;
//       await smsService.sendSMS(phone, resetMessage);
//     } catch (smsError) {
//       console.error("Failed to send password reset SMS:", smsError);
//       throw new Error("Failed to send password reset SMS");
//     }

//     return { message: "Temporary password sent to your phone number" };
//   }
// };

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import prisma from "./prisma.service.js";
import { smsService } from "./sms.service.js";
import { otpService } from "./otp.service.js";
import { emailService } from "./email.service.js";

export const authService = {
  async register(userData) {
    // Check if phone number already exists
    const existingUserByPhone = await prisma.user.findUnique({
      where: { phone: userData.phone }
    });

    if (existingUserByPhone) {
      throw new Error("Phone number already registered");
    }

    // Check if email already exists
    if (userData.email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUserByEmail) {
        throw new Error("Email already registered");
      }
    }

    // Use phone number as initial password
    const initialPassword = userData.phone;
    const hashedPassword = await bcrypt.hash(
      initialPassword,
      config.bcryptSaltRounds
    );

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: userData.role || "AGENT",
        isEmailVerified: false,
      },
    });

    // Send email verification OTP if email is provided
    if (userData.email) {
      try {
        console.log("We are trying to send OTP over email");
        await otpService.createAndSendOTP(userData.email, 'EMAIL_VERIFICATION', user.id);

      } catch (otpError) {
        console.error("Failed to send email verification OTP:", otpError);
        // Don't throw error, just log it
      }
    }

    // Send welcome SMS
    try {
      const welcomeMessage = `Welcome to TopInfo! Your account has been created successfully. Visit topinfo.rw to login using your phone number ${userData.phone} as both username and password. Please change your password after first login.`;

      await smsService.sendSMS(userData.phone, welcomeMessage);
    } catch (smsError) {
      console.error("Failed to send welcome SMS:", smsError);
    }

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return {
      user: userWithoutPassword,
      message: userData.email ? 'Registration successful. Please verify your email with the OTP sent to your email address.' : 'Registration successful.'
    };
  },

  async verifyEmail(email, otpCode) {
    try {
      // Verify OTP
      const otpResult = await otpService.verifyOTP(email, otpCode, 'EMAIL_VERIFICATION');

      if (!otpResult.success) {
        throw new Error(otpResult.message);
      }

      // Update user email verification status
      const user = await prisma.user.update({
        where: { email },
        data: { isEmailVerified: true },
      });

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(email, user.firstname, user.phone);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      return {
        user: userWithoutPassword,
        message: 'Email verified successfully'
      };
    } catch (error) {
      console.error("Email verification error:", error);
      throw error;
    }
  },

  async resendEmailVerification(email) {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.isEmailVerified) {
        throw new Error("Email is already verified");
      }

      // Resend OTP
      const result = await otpService.resendOTP(email, 'EMAIL_VERIFICATION');

      if (!result.success) {
        throw new Error(result.message);
      }

      return { message: 'Verification email sent successfully' };
    } catch (error) {
      console.error("Resend email verification error:", error);
      throw error;
    }
  },

  // async login(phone, password) {
  //   const user = await prisma.user.findUnique({
  //     where: { phone },
  //   });

  //   if (!user) {
  //     throw new Error("Invalid phone number or password");
  //   }

  //   if (!user.isActive) {
  //     throw new Error("Account is deactivated. Please contact support.");
  //   }

  //   const isValidPassword = await bcrypt.compare(password, user.password);

  //   if (!isValidPassword) {
  //     throw new Error("Invalid phone number or password");
  //   }

  //   const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
  //     expiresIn: config.jwt.expiresIn,
  //   });

  //   // Send login notification email if user has email
  //   // if (user.email) {
  //   //   try {
  //   //     await emailService.sendLoginNotification(
  //   //       user.email, 
  //   //       user.firstname || 'User',
  //   //       new Date(),
  //   //       // You might want to include additional info like IP address, device info, etc.
  //   //     );
  //   //   } catch (emailError) {
  //   //     console.error("Failed to send login notification email:", emailError);
  //   //     // Don't throw error, just log it since login was successful
  //   //   }
  //   // }

  //   const userWithoutPassword = { ...user };
  //   delete userWithoutPassword.password;
  //   return { user: userWithoutPassword, token };
  // },

  async login(phone, password) {
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new Error("Invalid phone number or password");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated. Please contact support.");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid phone number or password");
    }

    // Send OTP for login verification
    try {
      // Option 1: Send OTP via SMS (if you have SMS service configured)
      // await otpService.createAndSendOTP(user.phone, 'LOGIN_VERIFICATION', user.id);

      // Option 2: Send OTP via Email (if user has email)
      if (user.email && user.email.trim() !== '') {
        console.log("Sending login OTP to email:", user.email);
        await otpService.createAndSendOTP(user.email, 'LOGIN_VERIFICATION', user.id);
      } else {
        // If no email, you could send via SMS instead
        // For now, let's assume SMS service is not configured
        throw new Error("User email not found. Cannot send verification code.");
      }

      console.log("Login OTP sent successfully");
    } catch (otpError) {
      console.error("Failed to send login OTP:", otpError);
      throw new Error("Failed to send login verification code");
    }

    // Don't generate JWT token yet - wait for OTP verification
    // Return user info without token and password
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    return {
      user: userWithoutPassword,
      message: "Login verification code sent. Please verify to complete login.",
      requiresOTP: true
    };
  },

  // Fixed verifyLoginOTP method in authService
  async verifyLoginOTP(phone, otpCode) {
    try {
      const user = await prisma.user.findUnique({
        where: { phone },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.email || user.email.trim() === '') {
        throw new Error("User email not found for OTP verification");
      }

      // Verify OTP using email (since that's where the OTP was sent)
      // IMPORTANT: Use user.email, not phone for OTP verification
      const otpResult = await otpService.verifyOTP(user.email, otpCode, 'LOGIN_VERIFICATION');

      if (!otpResult.success) {
        throw new Error(otpResult.message);
      }

      // Generate JWT token after successful OTP verification
      const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });

      // Send login notification email if user has email
      if (user.email) {
        try {
          await emailService.sendLoginNotification(
            user.email,
            user.firstname || 'User',
            new Date(),
            // You might want to include additional info like IP address, device info, etc.
          );
        } catch (emailError) {
          console.error("Failed to send login notification email:", emailError);
          // Don't throw error, just log it since login was successful
        }
      }

      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      return {
        user: userWithoutPassword,
        token,
        message: "Login successful"
      };
    } catch (error) {
      console.error("Login OTP verification error:", error);
      throw error;
    }
  },

  async resetPassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(
      newPassword,
      config.bcryptSaltRounds
    );

    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Send password change confirmation SMS
    try {
      const confirmationMessage = `Your TopInfo password has been changed successfully. If you didn't make this change, please contact support immediately.`;
      await smsService.sendSMS(user.phone, confirmationMessage);
    } catch (smsError) {
      console.error("Failed to send password reset confirmation SMS:", smsError);
    }

    // Send password change confirmation email if user has email
    if (user.email) {
      try {
        await emailService.sendPasswordChangeNotification(
          user.email,
          user.firstname || 'User',
          new Date()
        );
      } catch (emailError) {
        console.error("Failed to send password change confirmation email:", emailError);
      }
    }

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  },

  async initiatePasswordReset(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Send password reset OTP
      const result = await otpService.createAndSendOTP(email, 'PASSWORD_RESET', user.id);

      if (!result.success) {
        throw new Error(result.message);
      }

      return { message: "Password reset code sent to your email" };
    } catch (error) {
      console.error("Initiate password reset error:", error);
      throw error;
    }
  },

  async verifyPasswordResetOTP(email, otpCode) {
    try {
      // Verify OTP
      const otpResult = await otpService.verifyOTP(email, otpCode, 'PASSWORD_RESET');

      if (!otpResult.success) {
        throw new Error(otpResult.message);
      }

      // Generate a temporary token for password reset
      const user = await prisma.user.findUnique({
        where: { email }
      });

      const resetToken = jwt.sign(
        { userId: user.id, email: user.email, purpose: 'password_reset' },
        config.jwt.secret,
        { expiresIn: '15m' } // 15 minutes
      );

      return {
        message: 'OTP verified successfully. You can now reset your password.',
        resetToken
      };
    } catch (error) {
      console.error("Verify password reset OTP error:", error);
      throw error;
    }
  },

  async completePasswordReset(resetToken, newPassword) {
    try {
      // Verify reset token
      const decoded = jwt.verify(resetToken, config.jwt.secret);

      if (decoded.purpose !== 'password_reset') {
        throw new Error('Invalid reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(
        newPassword,
        config.bcryptSaltRounds
      );

      // Update user password
      const user = await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      });

      // Send confirmation SMS
      try {
        const confirmationMessage = `Your TopInfo password has been reset successfully. If you didn't make this change, please contact support immediately.`;
        await smsService.sendSMS(user.phone, confirmationMessage);
      } catch (smsError) {
        console.error("Failed to send password reset confirmation SMS:", smsError);
      }

      // Send password reset confirmation email
      if (user.email) {
        try {
          await emailService.sendPasswordResetConfirmation(
            user.email,
            user.firstname || 'User',
            new Date()
          );
        } catch (emailError) {
          console.error("Failed to send password reset confirmation email:", emailError);
        }
      }

      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Reset token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid reset token');
      }
      console.error("Complete password reset error:", error);
      throw error;
    }
  },

  // Legacy method for backward compatibility
  // async forgetPassword(phone) {
  //   const user = await prisma.user.findUnique({
  //     where: { phone },
  //   });

  //   if (!user) {
  //     throw new Error("User not found");
  //   }

  //   // Generate a temporary password
  //   const temporaryPassword = Math.random().toString(36).slice(-8);
  //   const hashedPassword = await bcrypt.hash(
  //     temporaryPassword,
  //     config.bcryptSaltRounds
  //   );

  //   // Update user's password
  //   await prisma.user.update({
  //     where: { id: user.id },
  //     data: { password: hashedPassword },
  //   });

  //   // Send temporary password via SMS
  //   try {
  //     const resetMessage = `Your temporary TopInfo password is: ${temporaryPassword}. Please login at topinfo.rw and change your password immediately.`;
  //     await smsService.sendSMS(phone, resetMessage);
  //   } catch (smsError) {
  //     console.error("Failed to send password reset SMS:", smsError);
  //     throw new Error("Failed to send password reset SMS");
  //   }

  //   // Send temporary password notification email if user has email
  //   if (user.email) {
  //     try {
  //       await emailService.sendTemporaryPasswordEmail(
  //         user.email,
  //         user.firstname || 'User',
  //         temporaryPassword
  //       );
  //     } catch (emailError) {
  //       console.error("Failed to send temporary password email:", emailError);
  //     }
  //   }

  //   return { message: "Temporary password sent to your phone number" };
  // }
};