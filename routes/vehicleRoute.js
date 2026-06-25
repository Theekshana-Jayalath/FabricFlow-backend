import express from 'express';
import Vehicle from '../models/vehicleModel.js';
import Driver from '../models/driver.js';
import User from '../models/user.js'; // Fallback in case drivers are in Users

const router = express.Router();

// Get all vehicles
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        let query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.search) {
            query.$or = [
                { registrationNo: { $regex: req.query.search, $options: 'i' } },
                { vehicleId: { $regex: req.query.search, $options: 'i' } },
                { type: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const vehicles = await Vehicle.find(query)
            .populate('assignedDriver', 'driverName driverId empName empId name')
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Vehicle.countDocuments(query);

        res.status(200).json({
            success: true,
            vehicles,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalVehicles: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single vehicle
router.get('/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate('assignedDriver', 'driverName driverId empName empId name');
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        res.status(200).json({ success: true, vehicle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new vehicle
router.post('/', async (req, res) => {
    try {
        const newVehicle = new Vehicle(req.body);
        const savedVehicle = await newVehicle.save();
        res.status(201).json({ success: true, vehicle: savedVehicle });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update vehicle
router.put('/:id', async (req, res) => {
    try {
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).populate('assignedDriver', 'driverName driverId empName empId name');
        
        if (!updatedVehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        res.status(200).json({ success: true, vehicle: updatedVehicle });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
    try {
        const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!deletedVehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Assign driver to vehicle
router.post('/:id/assign-driver', async (req, res) => {
    try {
        const { driverId } = req.body;
        const vehicle = await Vehicle.findById(req.params.id);
        
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        
        vehicle.assignedDriver = driverId;
        vehicle.status = 'In Use';
        await vehicle.save();
        
        const updatedVehicle = await Vehicle.findById(req.params.id).populate('assignedDriver', 'driverName driverId empName empId name');
        res.status(200).json({ success: true, vehicle: updatedVehicle, message: 'Driver assigned successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Unassign driver from vehicle
router.post('/:id/unassign-driver', async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        
        vehicle.assignedDriver = null;
        vehicle.status = 'Available';
        await vehicle.save();
        
        res.status(200).json({ success: true, vehicle, message: 'Driver unassigned successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;