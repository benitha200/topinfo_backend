// import { authService } from '../services/auth.service.js';

// export const authController = {
//   async register(req, res, next) {
//     try {
//       const {
//         firstname,
//         lastname,
//         email,
//         phone,
//         location_province,
//         location_district,
//         location_sector,
//         role
//       } = req.body;
//       const profileImagePath = req.files?.profileImage?.[0]?.path || null;
//       const nationalIdImagePath = req.files?.nationalIdImage?.[0]?.path || null;

//       const data = {
//         firstname,
//         lastname,
//         email,
//         phone,
//         location_province,
//         location_district,
//         location_sector,
//         role,
//         profileImage: profileImagePath,
//         nationalIdImage: nationalIdImagePath,
//       };

//       const result = await authService.register(data);
//       res.status(201).json({
//         message: 'User registered successfully. Check your email for temporary password.',
//         user: result.user
//       });
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

//   // Optional: Add a route for password reset
//   async resetPassword(req, res, next) {
//     try {
//       const { userId, newPassword } = req.body;
//       const user = await authService.resetPassword(userId, newPassword);
//       res.json({
//         message: 'Password reset successfully',
//         user
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// };

import { authService } from '../services/auth.service.js';

export const authController = {
  async register(req, res, next) {
    // Previous register method remains the same
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
      next(error);
    }
  },

  async login(req, res, next) {
    // Previous login method remains the same
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    // Previous reset password method remains the same
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
  },

  // New method for forget password
  async forgetPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgetPassword(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // New method to complete password reset
  async completePasswordReset(req, res, next) {
    try {
      const { resetToken, newPassword } = req.body;
      const result = await authService.completePasswordReset(resetToken, newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}