import dotenv from 'dotenv';

dotenv.config();

const config = {
  database: {
    url: process.env.DATABASE_URL
  },
  jwt: {
    secret: process.env.JWT_SECRET || generateFallbackSecret(),
    expiresIn: '1d' // Optional: add an expiration time
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  sms: {
    email: 'ahupanet@gmail.com',
    password: 'Kigali@123'
  },
  // frontendUrl:"http://localhost:5173",
  // frontendUrl:"http://registration.rw",
  frontendUrl:"http://topinfo.rw",
  bcryptSaltRounds: 10,
  port: process.env.PORT || 3000,
  app: {
    url: process.env.APP_URL || 'http://localhost:3000'
  }
};

// Fallback secret generator in case .env is misconfigured
function generateFallbackSecret() {
  console.warn('JWT_SECRET not found in .env. Generating a temporary secret.');
  return require('crypto').randomBytes(64).toString('hex');
}

export default config;