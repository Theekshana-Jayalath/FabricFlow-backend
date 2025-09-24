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
    password, // Added missing password field
    dob,
    gender,
    age,
    role, // Added missing role field
  } = req.body;

  try {
    console.log('Creating new employee with data:', {
      empId,
      empName,
      jobPosition,
      emailAddress,
      status,
      address
    });

    // Validate required fields
    if (!empId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }
    if (!empName) {
      return res.status(400).json({ message: "Employee Name is required" });
    }
    if (!emailAddress) {
      return res.status(400).json({ message: "Email Address is required" });
    }
    if (!jobPosition) {
      return res.status(400).json({ message: "Job Position is required" });
    }
    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Check if employee with this ID already exists
    const existingEmployeeById = await Employee.findOne({ empId });
    if (existingEmployeeById) {
      return res.status(400).json({ message: "Employee ID already exists" });
    }

    // Check if employee with this email already exists
    const existingEmployeeByEmail = await Employee.findOne({ emailAddress });
    if (existingEmployeeByEmail) {
      return res.status(400).json({ message: "Email address already exists" });
    }

    const employee = new Employee({
      empId,
      empName,
      empPhone: empPhone || '',
      jobPosition,
      status: status ? status.toLowerCase() : 'active',
      address,
      emailAddress,
      password, // Include password in employee creation
      dob: dob ? new Date(dob) : null,
      gender: gender || null,
      age: age || null,
      role: role || 'employee', // Include role in employee creation
    });

    const savedEmployee = await employee.save();
    console.log('Employee saved successfully:', savedEmployee._id);
    
    return res.status(201).json({ 
      success: true,
      message: "Employee created successfully",
      employee: savedEmployee 
    });
    
  } catch (err) {
    console.error('Error creating employee:', err);
    
    // Handle specific MongoDB errors
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      const duplicateValue = err.keyValue[duplicateField];
      return res.status(400).json({ 
        message: `${duplicateField === 'empId' ? 'Employee ID' : 'Email address'} '${duplicateValue}' already exists` 
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }
    
    return res.status(500).json({ 
      message: "Internal server error while creating employee", 
      error: err.message 
    });
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
