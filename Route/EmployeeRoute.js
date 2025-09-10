// Route/EmployeeRoute.js
import express from "express";
import employeeController from "../Controllers/EmployeeController.js"; // default import

const router = express.Router();

// Get all employees
router.get("/", employeeController.getAllEmployees);

// Add new employee
router.post("/", employeeController.addEmployee);

// Get single employee by ID
router.get("/:id", employeeController.getEmployeeById);

// Update employee by ID
router.put("/:id", employeeController.updateEmployee);

// Delete employee by ID
router.delete("/:id", employeeController.deleteEmployee);

export default router;
