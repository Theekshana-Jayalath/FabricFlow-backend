import Vehicle from '../models/vehicleModel.js';

// Create a new vehicle
const createVehicle = async (req, res) => {
    try {
        const {
            registrationNumber,
            vehicleType,
            brand,
            model,
            capacity,
            fuelType,
            status,
            assignedDriverId
        } = req.body;

        // Check if vehicle with same registration number already exists
        const existingVehicle = await Vehicle.findOne({ registrationNumber });
        if (existingVehicle) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle with this registration number already exists'
            });
        }

        // Create new vehicle
        const vehicle = new Vehicle({
            registrationNumber,
            vehicleType,
            brand,
            model,
            capacity,
            fuelType,
            status,
            assignedDriverId: assignedDriverId || null
        });

        const savedVehicle = await vehicle.save();
        
        // Populate driver info if assigned
        await savedVehicle.populate('assignedDriverId', 'empName empPhone emailAddress empId');

        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully',
            data: savedVehicle
        });
    } catch (error) {
        console.error('Error creating vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating vehicle',
            error: error.message
        });
    }
};

// Get all vehicles
const getAllVehicles = async (req, res) => {
    try {
        const { status, vehicleType, page = 1, limit = 10 } = req.query;
        
        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (vehicleType) filter.vehicleType = vehicleType;

        // Calculate skip for pagination
        const skip = (page - 1) * limit;

        // Get vehicles with pagination
        const vehicles = await Vehicle.find(filter)
            .populate('assignedDriverId', 'empName empPhone emailAddress empId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalVehicles = await Vehicle.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Vehicles retrieved successfully',
            data: vehicles,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalVehicles / limit),
                totalVehicles,
                hasNext: page < Math.ceil(totalVehicles / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error getting vehicles:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving vehicles',
            error: error.message
        });
    }
};

// Get vehicle by ID
const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findById(id)
            .populate('assignedDriverId', 'empName empPhone emailAddress empId');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vehicle retrieved successfully',
            data: vehicle
        });
    } catch (error) {
        console.error('Error getting vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving vehicle',
            error: error.message
        });
    }
};

// Update vehicle
const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if vehicle exists
        const existingVehicle = await Vehicle.findById(id);
        if (!existingVehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // If updating registration number, check if it's unique
        if (updateData.registrationNumber && updateData.registrationNumber !== existingVehicle.registrationNumber) {
            const duplicateVehicle = await Vehicle.findOne({ 
                registrationNumber: updateData.registrationNumber,
                _id: { $ne: id }
            });
            
            if (duplicateVehicle) {
                return res.status(400).json({
                    success: false,
                    message: 'Another vehicle with this registration number already exists'
                });
            }
        }

        // Update vehicle
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('assignedDriverId', 'empName empPhone emailAddress empId');

        res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            data: updatedVehicle
        });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating vehicle',
            error: error.message
        });
    }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        await Vehicle.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully',
            data: vehicle
        });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting vehicle',
            error: error.message
        });
    }
};

// Get available vehicles (not assigned to any driver)
const getAvailableVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({
            assignedDriverId: null,
            status: 'Active'
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Available vehicles retrieved successfully',
            data: vehicles
        });
    } catch (error) {
        console.error('Error getting available vehicles:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving available vehicles',
            error: error.message
        });
    }
};

// Assign driver to vehicle
const assignDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const { driverId } = req.body;

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Update vehicle with assigned driver
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            id,
            { assignedDriverId: driverId },
            { new: true, runValidators: true }
        ).populate('assignedDriverId', 'empName empPhone emailAddress empId');

        res.status(200).json({
            success: true,
            message: 'Driver assigned to vehicle successfully',
            data: updatedVehicle
        });
    } catch (error) {
        console.error('Error assigning driver:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning driver to vehicle',
            error: error.message
        });
    }
};

// Unassign driver from vehicle
const unassignDriver = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Remove assigned driver
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            id,
            { assignedDriverId: null },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Driver unassigned from vehicle successfully',
            data: updatedVehicle
        });
    } catch (error) {
        console.error('Error unassigning driver:', error);
        res.status(500).json({
            success: false,
            message: 'Error unassigning driver from vehicle',
            error: error.message
        });
    }
};

export {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
    getAvailableVehicles,
    assignDriver,
    unassignDriver
};
