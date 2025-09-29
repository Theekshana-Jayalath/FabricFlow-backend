import express from "express";
import * as PurchaseController from "../controllers/PurchaseControllers.js";

const router = express.Router();

router.get("/", PurchaseController.getAllPurchases);
router.post("/", PurchaseController.addPurchase);
router.get("/:id", PurchaseController.getById);
router.put("/:id", PurchaseController.updatePurchase);
router.delete("/:id", PurchaseController.deletePurchase);

export default router;
