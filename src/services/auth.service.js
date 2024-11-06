import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import prisma from './prisma.service.js';

export const authService = {
  async register(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, config.bcryptSaltRounds);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
    const token = jwt.sign({ userId: user.id }, config.jwtSecret);
    delete user.password;
    return { user, token };
  },

  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new Error('Invalid password');

    const token = jwt.sign({ userId: user.id }, config.jwtSecret);
    delete user.password;
    return { user, token };
  },
};