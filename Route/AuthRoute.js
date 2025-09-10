import express from "express";
import AuthController from "../Controllers/AuthController.js";
import { verifyToken } from "../Middleware/AuthMiddleware.js";

const authRouter = express.Router();

// Test route
authRouter.get("/test", (req, res) => {
  res.json({ success: true, message: "Auth routes working!" });
});

// Authentication routes
authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.post("/logout", AuthController.logout);
authRouter.post("/google-oauth", AuthController.googleOAuth);

// Password reset routes
authRouter.post("/forgot-password", AuthController.forgotPassword);
authRouter.post("/verify-reset-code", AuthController.verifyResetCode);
authRouter.post("/reset-password", AuthController.resetPassword);

// Manual password change (for logged-in users) - requires authentication
authRouter.post("/change-password", verifyToken, AuthController.changePassword);

// Manual password change (public access - no authentication required)
authRouter.post("/manual-change-password", AuthController.manualChangePassword);

export default authRouter;
