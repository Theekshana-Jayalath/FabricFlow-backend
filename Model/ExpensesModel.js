// models/ExpensesModel.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const expensesSchema = new Schema(
  {
    expenseId: {
      type: String,
      required: [true, "Expense ID is required"],
      unique: true,
      trim: true,
      match: [/^EXP\d+$/, "Expense ID must start with 'EXP' followed by numbers"], // e.g., EXP1001
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      validate: {
        validator: (value) => value <= new Date(),
        message: "Date cannot be in the future",
      },
    },
    category: {
      type: String,
      enum: {
        values: ["transport", "other"],
        message: "Category must be either 'transport' or 'other'",
      },
      required: [true, "Category is required"],
      lowercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than 0"],
      validate: {
        validator: Number.isFinite,
        message: "Amount must be a valid number",
      },
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
      trim: true,
    },
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  }
);

export default mongoose.model("ExpensesModel", expensesSchema);
