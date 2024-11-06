// src/config/config.js

import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  bcryptSaltRounds: 10,
  database: {
    url: process.env.DATABASE_URL,
  },
  corsOrigin: process.env.CORS_ORIGIN || '*',
};