import express from "express";
import { authController } from "../controllers/index.js";

const authRouter = express.Router();

// Route to start OAuth flow
authRouter.get("/", authController.authorizeApp);

// Route to handle OAuth callback
authRouter.get("/google-sheets", authController.handleOAuthRedirect);

// Existing authentication route
authRouter.post("/", authController.handleUserAuthentication);

export default authRouter;
