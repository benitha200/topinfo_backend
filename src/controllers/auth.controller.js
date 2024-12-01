// import { authService } from '../services/auth.service.js';

// export const authController = {
//   async register(req, res, next) {
//     try {
//       const result = await authService.register(req.body);
//       res.status(201).json(result);
//     } catch (error) {
//       next(error);
//     }
//   },

//   async login(req, res, next) {
//     try {
//       const { email, password } = req.body;
//       const result = await authService.login(email, password);
//       res.json(result);
//     } catch (error) {
//       next(error);
//     }
//   },
// };

import { authService } from '../services/auth.service.js';

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        message: 'User registered successfully. Check your email for temporary password.',
        user: result.user
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // Optional: Add a route for password reset
  async resetPassword(req, res, next) {
    try {
      const { userId, newPassword } = req.body;
      const user = await authService.resetPassword(userId, newPassword);
      res.json({
        message: 'Password reset successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  }
};