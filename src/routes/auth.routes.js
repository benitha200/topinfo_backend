// import { Router } from 'express';
// import { authController } from '../controllers/auth.controller.js';
// import upload from '../middleware/multer.js';

// const router = Router();

// /**
//  * @swagger
//  * /auth/register:
//  *   post:
//  *     summary: Register a new user
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: User registered successfully
//  */
// router.post('/register', upload.fields([
//   { name: 'profileImage' },
//   { name: 'nationalIdImage' }
// ]), authController.register);

// /**
//  * @swagger
//  * /auth/login:
//  *   post:
//  *     summary: User login
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               email:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Login successful
//  */
// router.post('/login', authController.login);

// /**
//  * @swagger
//  * /auth/forget-password:
//  *   post:
//  *     summary: Initiate password reset
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               email:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Password reset link sent
//  */
// router.post('/forget-password', authController.forgetPassword);

// /**
//  * @swagger
//  * /auth/reset-password:
//  *   post:
//  *     summary: Complete password reset
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               resetToken:
//  *                 type: string
//  *               newPassword:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Password reset successfully
//  */
// router.post('/reset-password', authController.completePasswordReset);

// export default router;

import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import upload from '../middleware/multer.js';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *               - phone
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: User's first name
 *               lastname:
 *                 type: string
 *                 description: User's last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               location_province:
 *                 type: string
 *                 description: User's province
 *               location_district:
 *                 type: string
 *                 description: User's district
 *               location_sector:
 *                 type: string
 *                 description: User's sector
 *               role:
 *                 type: string
 *                 description: User's role
 *                 default: AGENT
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: User's profile image
 *               nationalIdImage:
 *                 type: string
 *                 format: binary
 *                 description: User's national ID image
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                 requiresEmailVerification:
 *                   type: boolean
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/register', upload.fields([
  { name: 'profileImage' },
  { name: 'nationalIdImage' }
]), authController.register);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email address with OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               otp:
 *                 type: string
 *                 description: OTP code sent to email
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-email', authController.verifyEmail);

/**
 * @swagger
 * /auth/resend-email-verification:
 *   post:
 *     summary: Resend email verification OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       400:
 *         description: Email already verified or rate limit exceeded
 *       404:
 *         description: User not found
 */
router.post('/resend-email-verification', authController.resendEmailVerification);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login (initiates OTP verification)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login verification code sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                 requiresOTP:
 *                   type: boolean
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/verify-login-otp:
 *   post:
 *     summary: Verify login OTP and complete authentication
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               otp:
 *                 type: string
 *                 description: OTP code sent for login verification
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
router.post('/verify-otp', authController.verifyLoginOTP);

/**
 * @swagger
 * /auth/initiate-password-reset:
 *   post:
 *     summary: Initiate password reset (sends OTP to email)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Password reset code sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 */
router.post('/initiate-password-reset', authController.initiatePasswordReset);

/**
 * @swagger
 * /auth/verify-password-reset-otp:
 *   post:
 *     summary: Verify password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               otp:
 *                 type: string
 *                 description: OTP code sent for password reset
 *     responses:
 *       200:
 *         description: OTP verified successfully, reset token provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 resetToken:
 *                   type: string
 *                   description: Temporary token for password reset
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-password-reset-otp', authController.verifyPasswordResetOTP);

/**
 * @swagger
 * /auth/complete-password-reset:
 *   post:
 *     summary: Complete password reset with new password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *                 description: Reset token from OTP verification
 *               newPassword:
 *                 type: string
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or expired reset token
 */
router.post('/complete-password-reset', authController.completePasswordReset);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password (admin/internal use)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newPassword
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               newPassword:
 *                 type: string
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /auth/forget-password:
 *   post:
 *     summary: Legacy password reset method
 *     tags: [Auth]
 *     deprecated: true
 *     description: This endpoint is deprecated. Use /initiate-password-reset instead.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *     responses:
 *       200:
 *         description: Password reset instructions sent
 *       404:
 *         description: User not found
 */
router.post('/forget-password', authController.forgetPassword);

export default router;