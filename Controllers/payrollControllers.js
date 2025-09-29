// controllers/PayrollController.js
import Payroll from "../Model/PayrollModels.js";

// Helper function to safely convert to number
const toNumber = (val, defaultVal = 0) => Number(val) || defaultVal;

// Helper to map type->title for schema compatibility
const mapTypeToTitle = (arr) =>
  Array.isArray(arr)
    ? arr.map((item) => ({
        title: item.title || item.type,
        amount: toNumber(item.amount),
      }))
    : [];

// ✅ Get all payrolls
export const getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find();
    return res.status(200).json({ payrolls });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get payroll by ID
export const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });
    return res.status(200).json({ payroll });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add new payroll
export const addPayroll = async (req, res) => {
  try {
    let {
      empId,
      empName,
      payrollId,
      date,
      allowances,
      deductions,
      workingDays,
      absentDays,
      overtimeHours,
      otRate,
      basicSalary,
    } = req.body;

    // Convert numeric fields
    basicSalary = toNumber(basicSalary);
    workingDays = toNumber(workingDays, 1);
    absentDays = toNumber(absentDays);
    overtimeHours = toNumber(overtimeHours);
    otRate = toNumber(otRate);

    // Map type to title
    allowances = mapTypeToTitle(allowances);
    deductions = mapTypeToTitle(deductions);

    // Calculate amounts
    const otAmount = overtimeHours * otRate * (basicSalary / workingDays / 8);
    const noPay = (basicSalary / workingDays) * absentDays;
    const epfEmployee = basicSalary * 0.08;

    const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

    const grossSalary = basicSalary + totalAllowances + otAmount;
    const netSalary = grossSalary - (epfEmployee + noPay + totalDeductions);

    const payroll = new Payroll({
      empId,
      empName,
      payrollId,
      date,
      allowances,
      deductions,
      workingDays,
      absentDays,
      overtimeHours,
      otRate,
      otAmount,
      epfEmployee,
      noPay,
      basicSalary,
      netsalary: netSalary,
    });

    await payroll.save();
    return res.status(201).json({ payroll });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unable to add payroll", error: err.message });
  }
};

// ✅ Update payroll
export const updatePayroll = async (req, res) => {
  try {
    let {
      empId,
      empName,
      payrollId,
      date,
      allowances,
      deductions,
      workingDays,
      absentDays,
      overtimeHours,
      otRate,
      basicSalary,
    } = req.body;

    // Convert numeric fields
    basicSalary = toNumber(basicSalary);
    workingDays = toNumber(workingDays, 1);
    absentDays = toNumber(absentDays);
    overtimeHours = toNumber(overtimeHours);
    otRate = toNumber(otRate);

    // Map type to title
    allowances = mapTypeToTitle(allowances);
    deductions = mapTypeToTitle(deductions);

    // Recalculate amounts
    const otAmount = overtimeHours * otRate * (basicSalary / workingDays / 8);
    const noPay = (basicSalary / workingDays) * absentDays;
    const epfEmployee = basicSalary * 0.08;

    const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

    const grossSalary = basicSalary + totalAllowances + otAmount;
    const netSalary = grossSalary - (epfEmployee + noPay + totalDeductions);

    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      {
        empId,
        empName,
        payrollId,
        date,
        allowances,
        deductions,
        workingDays,
        absentDays,
        overtimeHours,
        otRate,
        otAmount,
        epfEmployee,
        noPay,
        basicSalary,
        netsalary: netSalary,
      },
      { new: true, runValidators: true }
    );

    if (!payroll) return res.status(404).json({ message: "Payroll not found" });
    return res.status(200).json({ payroll });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unable to update payroll", error: err.message });
  }
};

// ✅ Delete payroll
export const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });
    return res.status(200).json({ message: "Payroll deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to delete payroll" });
  }
}
