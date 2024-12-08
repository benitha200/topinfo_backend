import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.js";

const userRouter = Router();

// Get all users (admin/manager only)
userRouter.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  userController.getAllUsers
);
userRouter.get(
  "/my-agents",
  authenticate,
  authorize("AGENT"),
  userController.getMyAgents
);
// Store Admin,Agent, super Agent (admin/manager only)
userRouter.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  upload.fields([
    { name: 'profileImage' }, 
    { name: 'nationalIdImage' } 
  ]), 
  userController.createUser
);
// Super Agent Store normal Agent
userRouter.post(
  "/add-agent",
  authenticate,
  authorize("AGENT"),
  userController.createAgent
);

// Get user by ID (authenticated users)
userRouter.get("/:id", authenticate, userController.getUserById);

// Update user (authenticated users)
userRouter.put(
  "/:id",
  authenticate,
  //   validateRequest(updateUserSchema),
  upload.fields([
    { name: 'profileImage' }, 
    { name: 'nationalIdImage' } 
  ]), 
  userController.updateUser
);

// Deactivate user (admin only)
userRouter.patch(
  "/:id/deactivate",
  authenticate,
  authorize("ADMIN"),
  userController.deactivateUser
);

userRouter.delete(
  "/:id",
  authenticate,
  // authorize("ADMIN"),
  userController.deleteUser
);

export default userRouter;
