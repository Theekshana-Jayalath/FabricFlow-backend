import express from 'express';
import Distribution from '../models/distributionModel.js';
import Order from '../models/orderModel.js';
import Driver from '../models/driver.js';
import User from '../models/user.js'; // Fallback for drivers

const router = express.Router();

// Get available drivers (split into free and busy)
router.get('/available-drivers', async (req, res) => {
    try {
        // Find all drivers
        const drivers = await User.find({ 
            role: 'employee', 
            jobPosition: { $regex: new RegExp('driver', 'i') } 
        }).select('name empName empId _id');

        // Find drivers currently IN_TRANSIT or ASSIGNED
        const activeDistributions = await Distribution.find({
            deliveryStatus: { $in: ['ASSIGNED', 'IN_TRANSIT'] }
        });
        
        const busyDriverIds = activeDistributions.map(d => d.driverId.toString());

        const freeDrivers = [];
        const busyDrivers = [];

        drivers.forEach(driver => {
            if (busyDriverIds.includes(driver._id.toString())) {
                busyDrivers.push(driver);
            } else {
                freeDrivers.push(driver);
            }
        });

        res.status(200).json({
            success: true,
            data: {
                freeDrivers,
                busyDrivers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Assign order to driver
router.post('/assign', async (req, res) => {
    try {
        const { orderId, driverId, assignedBy, notes } = req.body;
        
        // 1. Create Distribution
        const newDistribution = new Distribution({
            orderId,
            driverId,
            assignedBy,
            notes,
            deliveryStatus: 'ASSIGNED'
        });
        await newDistribution.save();

        // 2. Update Order Status
        await Order.findByIdAndUpdate(orderId, { orderStatus: 'ASSIGNEDTODRIVER' });

        res.status(201).json({ success: true, message: 'Order assigned successfully', distribution: newDistribution });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get assigned distributions for a driver
router.get('/assigned', async (req, res) => {
    try {
        const { driverId } = req.query;
        if (!driverId) return res.status(400).json({ success: false, message: 'driverId is required' });

        const distributions = await Distribution.find({ driverId }).populate('orderId');
        
        // The frontend might expect an array directly or { success: true, data: [] }
        // Let's return JSON array or { success: true, data: ... }
        res.status(200).json(distributions);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update distribution status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // e.g., 'IN_TRANSIT', 'DELIVERED'
        // if frontend sends standard body or directly
        const newStatus = status || req.body.newStatus || req.body; 
        
        const updateData = { deliveryStatus: newStatus.newStatus || newStatus };
        if (updateData.deliveryStatus === 'DELIVERED') {
            updateData.deliveredAt = Date.now();
        }

        const distribution = await Distribution.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        if (!distribution) return res.status(404).json({ success: false, message: 'Distribution not found' });

        if (updateData.deliveryStatus === 'DELIVERED') {
            await Order.findByIdAndUpdate(distribution.orderId, { orderStatus: 'DELIVERED' });
        } else if (updateData.deliveryStatus === 'IN_TRANSIT') {
            await Order.findByIdAndUpdate(distribution.orderId, { orderStatus: 'SHIPPED' });
        }

        res.status(200).json({ success: true, distribution });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;