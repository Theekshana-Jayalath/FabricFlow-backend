import express from "express";
import {
  getAllPayrolls,
  getPayrollById,
  addPayroll,
  updatePayroll,
  deletePayroll
} from "../Controllers/payrollControllers.js";

const router = express.Router();

router.get("/", getAllPayrolls);
router.get("/:id", getPayrollById);
router.post("/", addPayroll);
router.put("/:id", updatePayroll);
router.delete("/:id", deletePayroll);

export default router;
