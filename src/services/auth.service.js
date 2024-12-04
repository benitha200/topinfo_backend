// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import config from '../config/config.js';
// import prisma from './prisma.service.js';

// export const authService = {
//   async register(userData) {
//     const hashedPassword = await bcrypt.hash(userData.password, config.bcryptSaltRounds);
//     const user = await prisma.user.create({
//       data: {
//         ...userData,
//         password: hashedPassword,
//       },
//     });
//     const token = jwt.sign({ userId: user.id }, config.jwtSecret);
//     delete user.password;
//     return { user, token };
//   },

//   async login(email, password) {
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) throw new Error('User not found');
    
//     const isValidPassword = await bcrypt.compare(password, user.password);
//     if (!isValidPassword) throw new Error('Invalid password');

//     const token = jwt.sign({ userId: user.id }, config.jwtSecret);
//     delete user.password;
//     return { user, token };
//   },
// };

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import prisma from './prisma.service.js';
import { generateRandomPassword } from '../utils/passwordGenerator.js';
import { sendWelcomeEmail } from '../services/email.service.js';

export const authService = {
  async register(userData) {
    // Generate a strong random password
    const randomPassword = generateRandomPassword();
    // const randomPassword = userData.password;
    
    // Hash the generated password
    const hashedPassword = await bcrypt.hash(randomPassword, config.bcryptSaltRounds);

    // Create user with the hashed password
    const user = await prisma.user.create({
      data: {
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        role: userData.role || 'AGENT', // Default to AGENT if not specified
        location_province: userData.location_province,
        location_district: userData.location_district,
        location_sector: userData.location_sector
      }
    });

    // Generate JWT token with explicit secret and options
    const token = jwt.sign(
      { userId: user.id }, 
      config.jwt.secret, 
      { expiresIn: config.jwt.expiresIn }
    );

    // Send welcome email with temporary password
    try {
      await sendWelcomeEmail({
        email: user.email,
        firstname: user.firstname,
        temporaryPassword: randomPassword
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Remove password before returning
    delete user.password;

    return { user, token };
  },

  async login(email, password) {
    const user = await prisma.user.findUnique({ 
      where: { email } 
    });

    if (!user) throw new Error('User not found');
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) throw new Error('Invalid password');
    
    const token = jwt.sign(
      { userId: user.id }, 
      config.jwt.secret, 
      { expiresIn: config.jwt.expiresIn }
    );
    
    delete user.password;
    
    return { user, token };
  },

  async resetPassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    delete user.password;
    return user;
  }
};