import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
// import { validateRequest } from '../middleware/validation.middleware.js';
// import { 
//   updateUserSchema 
// } from '../validations/auth.validation.js';

const userRouter = Router();

// Get all users (admin/manager only)
userRouter.get('/', 
  authenticate,
  authorize('ADMIN'),
  userController.getAllUsers
);

// Get user by ID (authenticated users)
userRouter.get('/:id', 
  authenticate,
  userController.getUserById
);

// Update user (authenticated users)
userRouter.put('/:id', 
  authenticate,
//   validateRequest(updateUserSchema),
  userController.updateUser
);

// Deactivate user (admin only)
userRouter.patch('/:id/deactivate', 
  authenticate,
  authorize('ADMIN'),
  userController.deactivateUser
);

// Delete user (admin only)
userRouter.delete('/:id', 
  authenticate,
  authorize('ADMIN'),
  userController.deleteUser
);

export default userRouter;