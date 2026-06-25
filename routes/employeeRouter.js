import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' }).select('-password');
        res.status(200).json({ success: true, employees, count: employees.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all drivers specifically (employees with Driver jobPosition)
router.get('/drivers', async (req, res) => {
    try {
        // Find employees with jobPosition matching Driver (case insensitive)
        const drivers = await User.find({ 
            role: 'employee', 
            jobPosition: { $regex: new RegExp('driver', 'i') } 
        }).select('-password');
        res.status(200).json({ success: true, drivers, count: drivers.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
    try {
        const employee = await User.findOne({ _id: req.params.id, role: 'employee' }).select('-password');
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
        res.status(200).json({ success: true, employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new employee (fallback if not using auth/register)
router.post('/', async (req, res) => {
    try {
        const employeeData = { ...req.body, role: 'employee' };
        if (employeeData.password) {
            const salt = await bcrypt.genSalt(10);
            employeeData.password = await bcrypt.hash(employeeData.password, salt);
        } else {
            const salt = await bcrypt.genSalt(10);
            employeeData.password = await bcrypt.hash('password123', salt);
        }
        
        const newEmployee = new User(employeeData);
        const savedEmployee = await newEmployee.save();
        
        const empObj = savedEmployee.toObject();
        delete empObj.password;
        
        res.status(201).json({ success: true, employee: empObj });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update employee
router.put('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData.role;
        delete updateData.password;

        const updatedEmployee = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'employee' },
            { $set: updateData },
            { new: true }
        ).select('-password');
        
        if (!updatedEmployee) return res.status(404).json({ success: false, message: 'Employee not found' });
        res.status(200).json({ success: true, employee: updatedEmployee });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete employee
router.delete('/:id', async (req, res) => {
    try {
        const deletedEmployee = await User.findOneAndDelete({ _id: req.params.id, role: 'employee' });
        if (!deletedEmployee) return res.status(404).json({ success: false, message: 'Employee not found' });
        res.status(200).json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;