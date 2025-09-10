import Employee from "../Model/EmployeeModel.js";

// ✅ Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: "No employees found" });
    }
    return res.status(200).json({ employees });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};

// ✅ Add new employee
const addEmployee = async (req, res) => {
  const {
    empId,
    empName,
    empPhone,
    jobPosition,
    status,
    address,
    emailAddress,
    dob,
    gender,
    age,
  } = req.body;

  try {
    const employee = new Employee({
      empId,
      empName,
      empPhone,
      jobPosition,
      status,
      address,
      emailAddress,
      dob,
      gender,
      age,
    });
    await employee.save();
    return res.status(201).json({ employee });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Unable to add employee", error: err });
  }
};

// ✅ Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    return res.status(200).json({ employee });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};

// ✅ Update employee
const updateEmployee = async (req, res) => {
  const {
    empId,
    empName,
    empPhone,
    jobPosition,
    status,
    address,
    emailAddress,
    dob,
    gender,
    age,
  } = req.body;

  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        empId,
        empName,
        empPhone,
        jobPosition,
        status,
        address,
        emailAddress,
        dob,
        gender,
        age,
      },
      { new: true } // return the updated document
    );

    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    return res.status(200).json({ employee });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Unable to update employee", error: err });
  }
};

// ✅ Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    return res.status(200).json({ message: "Employee deleted", employee });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Unable to delete employee", error: err });
  }
};

export default {
  getAllEmployees,
  addEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
