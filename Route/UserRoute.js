// Route/UserRoute.js
import express from "express";
import userController from "../Controllers/UserController.js"; // ✅ default import

const router = express.Router();

// Get all users
router.get("/", userController.getAllUsers);

// Add new user
router.post("/", userController.addUsers);

// Get single user by ID
router.get("/:id", userController.getById);

// Update user by ID
router.put("/:id", userController.updateUser);

// Delete user by ID
router.delete("/:id", userController.deleteUser);

export default router;
