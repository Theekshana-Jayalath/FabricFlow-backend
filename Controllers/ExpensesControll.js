import FinanceExpenses from "../Model/ExpensesModel.js";

// Get all expenses
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await FinanceExpenses.find();
    return res.status(200).json({ expenses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add a new expense
export const addExpense = async (req, res) => {
  try {
    const { date, category, amount, description } = req.body;

    const expenseId = `EXP${Date.now()}`; // generate unique expenseId

    const expense = new FinanceExpenses({
      expenseId,
      date,
      category,
      amount,
      description,
    });

    await expense.save();
    return res.status(201).json({ expense });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to add expense" });
  }
};

// Get expense by expenseId
export const getExpenseById = async (req, res) => {
  try {
    const expense = await FinanceExpenses.findOne({ expenseId: req.params.id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    return res.status(200).json({ expense });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update expense by expenseId
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params; // this is expenseId
    const updatedExpense = await FinanceExpenses.findOneAndUpdate(
      { expenseId: id },
      req.body,
      { new: true }
    );
    if (!updatedExpense)
      return res.status(404).json({ message: "Expense not found" });
    res.json(updatedExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to update expense" });
  }
};

// Delete expense by expenseId
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params; // this is expenseId
    const expense = await FinanceExpenses.findOneAndDelete({ expenseId: id });

    if (!expense)
      return res.status(404).json({ message: "Expense not found" });

    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to delete expense" });
  }
};
