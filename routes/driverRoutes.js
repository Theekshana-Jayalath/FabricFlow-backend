import express from 'express';
import Driver from '../models/driver.js';

const router = express.Router();

// Get all drivers (specifically matched to what frontend uses)
router.get('/allDrivers', async (req, res) => {
    try {
        const drivers = await Driver.find().populate('vehicleAssigned');
        res.status(200).json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fallback for getting all drivers using standard REST route
router.get('/', async (req, res) => {
    try {
        const drivers = await Driver.find().populate('vehicleAssigned');
        res.status(200).json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single driver by ID
router.get('/:id', async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id).populate('vehicleAssigned');
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.status(200).json(driver);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new driver
router.post('/', async (req, res) => {
    try {
        const newDriver = new Driver(req.body);
        const savedDriver = await newDriver.save();
        res.status(201).json(savedDriver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a driver
router.put('/:id', async (req, res) => {
    try {
        const updatedDriver = await Driver.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        );
        if (!updatedDriver) return res.status(404).json({ message: 'Driver not found' });
        res.status(200).json(updatedDriver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a driver
router.delete('/:id', async (req, res) => {
    try {
        const deletedDriver = await Driver.findByIdAndDelete(req.params.id);
        if (!deletedDriver) return res.status(404).json({ message: 'Driver not found' });
        res.status(200).json({ message: 'Driver deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;