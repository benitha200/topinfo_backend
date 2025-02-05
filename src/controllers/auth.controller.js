import { authService } from '../services/auth.service.js';

export const authController = {
  async register(req, res, next) {
    try {
      const {
        firstname,
        lastname,
        email,
        phone,
        location_province,
        location_district,
        location_sector,
        role
      } = req.body;

      // Validate required fields
      if (!firstname || !lastname || !email || !phone) {
        return res.status(400).json({
          message: 'First name, last name, email, and phone are required'
        });
      }

      const profileImagePath = req.files?.profileImage?.[0]?.path || null;
      const nationalIdImagePath = req.files?.nationalIdImage?.[0]?.path || null;

      const data = {
        firstname,
        lastname,
        email,
        phone,
        location_province,
        location_district,
        location_sector,
        role,
        profileImage: profileImagePath,
        nationalIdImage: nationalIdImagePath,
      };

      const result = await authService.register(data);

      res.status(201).json({
        message: 'User registered successfully. Check your email for temporary password.',
        user: result.user
      });
    } catch (error) {
      if (error.message.includes('already registered')) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({
          message: 'Phone number and password are required'
        });
      }

      const result = await authService.login(phone, password);
      res.json({
        message: 'Login successful',
        ...result
      });
    } catch (error) {
      if (error.message.includes('Invalid phone number or password')) {
        return res.status(401).json({ message: error.message });
      }
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { userId, newPassword } = req.body;

      if (!userId || !newPassword) {
        return res.status(400).json({
          message: 'User ID and new password are required'
        });
      }

      const user = await authService.resetPassword(userId, newPassword);
      res.json({
        message: 'Password reset successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  },

  async forgetPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message: 'Email is required'
        });
      }

      const result = await authService.forgetPassword(email);
      res.json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  },

  async completePasswordReset(req, res, next) {
    try {
      const { resetToken, newPassword } = req.body;

      if (!resetToken || !newPassword) {
        return res.status(400).json({
          message: 'Reset token and new password are required'
        });
      }

      const result = await authService.completePasswordReset(resetToken, newPassword);
      res.json(result);
    } catch (error) {
      if (error.message.includes('expired') || error.message.includes('Invalid')) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
};