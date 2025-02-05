import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import prisma from "./prisma.service.js";
import { smsService } from "./sms.service.js";

export const authService = {
  async register(userData) {
    // Check if phone number already exists
    const existingUserByPhone = await prisma.user.findUnique({
      where: { phone: userData.phone }
    });

    if (existingUserByPhone) {
      throw new Error("Phone number already registered");
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
      },
    });

    const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    // Send welcome SMS
    try {
      const welcomeMessage = `Welcome to TopInfo! Your account has been created successfully. Visit topinfo.rw to login using your phone number ${userData.phone} as both username and password. Please change your password after first login.`;
      
      await smsService.sendSMS(userData.phone, welcomeMessage);
    } catch (smsError) {
      console.error("Failed to send welcome SMS:", smsError);
    }

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return { user: userWithoutPassword, token };
  },

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

    const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return { user: userWithoutPassword, token };
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

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  },

  async forgetPassword(phone) {
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Generate a temporary password
    const temporaryPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(
      temporaryPassword,
      config.bcryptSaltRounds
    );

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Send temporary password via SMS
    try {
      const resetMessage = `Your temporary TopInfo password is: ${temporaryPassword}. Please login at topinfo.rw and change your password immediately.`;
      await smsService.sendSMS(phone, resetMessage);
    } catch (smsError) {
      console.error("Failed to send password reset SMS:", smsError);
      throw new Error("Failed to send password reset SMS");
    }

    return { message: "Temporary password sent to your phone number" };
  }
};