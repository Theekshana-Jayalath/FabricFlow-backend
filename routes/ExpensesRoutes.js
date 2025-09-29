import express from "express";
import {
  getAllExpenses,
  addExpense,
  getExpenseById,
  updateExpense,
  deleteExpense
} from "../Controllers/ExpensesControll.js";

const router = express.Router();

router.get("/", getAllExpenses);
router.post("/", addExpense);
router.get("/:id", getExpenseById);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
