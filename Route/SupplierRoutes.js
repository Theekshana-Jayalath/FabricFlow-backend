import express from "express";
import * as SupplierController from "../controllers/SupplierControllers.js";

const router = express.Router();

router.get("/", SupplierController.getAllSuppliers);
router.post("/", SupplierController.addSuppliers);
router.get("/:id", SupplierController.getById);
router.put("/:id", SupplierController.updateSupplier);
router.delete("/:id", SupplierController.deleteSupplier);

export default router;
