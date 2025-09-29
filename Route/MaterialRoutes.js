import express from "express";
import * as MaterialController from "../controllers/MaterialController.js";

const router = express.Router();

router.get("/", MaterialController.getAllMaterials);
router.post("/", MaterialController.addMaterials);
router.get("/:id", MaterialController.getById);
router.put("/:id", MaterialController.updateMaterial);
router.delete("/:id", MaterialController.deleteMaterial);

export default router;
