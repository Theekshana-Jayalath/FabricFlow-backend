import Employee from '../Model/EmployeeModel.js';
import mongoose from 'mongoose';

// Get all drivers (employees with driver job position)
const getAllDrivers = async (req, res) => {
    try {
        const { status, availableOnly } = req.query;
        
        // Build filter object - find employees who are drivers
        const filter = {
            role: 'employee',
            jobPosition: { $regex: /^driver$/i }
        };
        if (status) filter.status = status;
        
        // Get drivers (employees with driver position)
        const drivers = await Employee.find(filter).select('-password -__v');
        
        res.status(200).json({
            success: true,
            message: 'Drivers retrieved successfully',
            data: drivers
        });
    } catch (error) {
        console.error('Error getting drivers:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving drivers',
            error: error.message
        });
    }
};

// Get driver by ID (employee with driver job position)
const getDriverById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid driver ID format'
            });
        }

        const driver = await Employee.findById(id).select('-password -__v');

        if (!driver || driver.jobPosition.toLowerCase() !== 'driver') {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Driver retrieved successfully',
            data: driver
        });
    } catch (error) {
        console.error('Error getting driver:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving driver',
            error: error.message
        });
    }
};

export {
    getAllDrivers,
    getDriverById
};