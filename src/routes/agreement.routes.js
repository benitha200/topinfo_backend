import { Router } from "express";
import { agreementController } from "../controllers/agreement.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const agreementRouter = Router();

agreementRouter.post("/", authenticate, agreementController.createAgreement);
agreementRouter.get("/user/:userId", authenticate, agreementController.getUserAgreement);

export default agreementRouter;