// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import config from "../config/config.js";
// import prisma from "./prisma.service.js";
// import { generateRandomPassword } from "../utils/passwordGenerator.js";
// import { sendWelcomeEmail } from "../services/email.service.js";

// export const authService = {
//   async register(userData) {
//     // Generate a strong random password
//     const randomPassword = generateRandomPassword();
//     // const randomPassword = userData.password;

//     // Hash the generated password
//     const hashedPassword = await bcrypt.hash(
//       randomPassword,
//       config.bcryptSaltRounds
//     );

//     // Create user with the hashed password
//     const user = await prisma.user.create({
//       data: {
//         ...userData,
//         password: hashedPassword,
//         role: userData.role || "AGENT",
//       },
//     });

//     // Generate JWT token with explicit secret and options
//     const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
//       expiresIn: config.jwt.expiresIn,
//     });

//     // Send welcome email with temporary password
//     try {
//       await sendWelcomeEmail({
//         email: user.email,
//         firstname: user.firstname,
//         temporaryPassword: randomPassword,
//       });
//     } catch (emailError) {
//       console.error("Failed to send welcome email:", emailError);
//     }

//     // Remove password before returning
//     delete user.password;

//     return { user, token };
//   },

//   async login(email, password) {
//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) throw new Error("User not found");

//     const isValidPassword = await bcrypt.compare(password, user.password);

//     if (!isValidPassword) throw new Error("Invalid password");

//     const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
//       expiresIn: config.jwt.expiresIn,
//     });

//     delete user.password;

//     return { user, token };
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

//     delete user.password;
//     return user;
//   },
// };

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import prisma from "./prisma.service.js";
import { generateRandomPassword } from "../utils/passwordGenerator.js";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../services/email.service.js";

export const authService = {
  async register(userData) {
    // Previous register method remains the same
    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(
      randomPassword,
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

    try {
      await sendWelcomeEmail({
        email: user.email,
        firstname: user.firstname,
        temporaryPassword: randomPassword,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    delete user.password;
    return { user, token };
  },

  async login(email, password) {
    // Previous login method remains the same
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new Error("User not found");

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) throw new Error("Invalid password");

    const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    delete user.password;
    return { user, token };
  },

  async resetPassword(userId, newPassword) {
    // Previous reset password method remains the same
    const hashedPassword = await bcrypt.hash(
      newPassword,
      config.bcryptSaltRounds
    );

    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    delete user.password;
    return user;
  },

  // New method for forget password
  async forgetPassword(email) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new Error("User not found");

    // Generate a password reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' }, 
      config.jwt.secret, 
      { expiresIn: '1h' }
    );

    // Send password reset email with reset link
    try {
      await sendPasswordResetEmail({
        email: user.email,
        firstname: user.firstname,
        resetToken: resetToken
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      throw new Error("Failed to send password reset email");
    }

    return { message: "Password reset link sent to your email" };
  },

  // New method to verify and complete password reset
  async completePasswordReset(resetToken, newPassword) {
    try {
      // Verify the reset token
      const decoded = jwt.verify(resetToken, config.jwt.secret);

      // Check if the token is for password reset
      if (decoded.type !== 'password-reset') {
        throw new Error("Invalid reset token");
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(
        newPassword,
        config.bcryptSaltRounds
      );

      // Update user's password
      const user = await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      });

      delete user.password;
      return { message: "Password reset successfully" };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error("Password reset link has expired");
      }
      throw error;
    }
  }
}