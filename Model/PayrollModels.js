// models/PayrollModels.js
import mongoose from "mongoose";

const allowanceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Allowance title is required"],
    trim: true,
    minlength: [2, "Title must be at least 2 characters"],
    maxlength: [50, "Title must be at most 50 characters"],
  },
  amount: {
    type: Number,
    required: [true, "Allowance amount is required"],
    min: [0, "Amount cannot be negative"],
  },
});

const deductionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Deduction title is required"],
    trim: true,
    minlength: [2, "Title must be at least 2 characters"],
    maxlength: [50, "Title must be at most 50 characters"],
  },
  amount: {
    type: Number,
    required: [true, "Deduction amount is required"],
    min: [0, "Amount cannot be negative"],
  },
});

const payrollSchema = new mongoose.Schema(
  {
    empId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true,
      
    },
    empName: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    payrollId: {
      type: String,
      required: [true, "Payroll ID is required"],
      trim: true,
      unique: true,
      
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      validate: {
        validator: (v) => v <= new Date(),
        message: "Date cannot be in the future",
      },
    },
    basicSalary: {
      type: Number,
      required: [true, "Basic salary is required"],
      min: [0, "Basic salary cannot be negative"],
    },
    workingDays: {
      type: Number,
      required: [true, "Working days are required"],
      min: [1, "Working days must be at least 1"],
      max: [31, "Working days cannot exceed 31"],
    },
    absentDays: {
      type: Number,
      default: 0,
      min: [0, "Absent days cannot be negative"],
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: [0, "Overtime hours cannot be negative"],
    },
    otRate: {
      type: Number,
      default: 0,
      min: [0, "OT rate cannot be negative"],
    },
    otAmount: {
      type: Number,
      default: 0,
      min: [0, "OT amount cannot be negative"],
    },
    allowances: [allowanceSchema],
    deductions: [deductionSchema],
    epfEmployee: {
      type: Number,
      default: 0,
      min: [0, "EPF Employee cannot be negative"],
    },
    noPay: {
      type: Number,
      default: 0,
      min: [0, "No pay cannot be negative"],
    },
    netsalary: {
      type: Number,
      default: 0,
      min: [0, "Net salary cannot be negative"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payroll", payrollSchema);
