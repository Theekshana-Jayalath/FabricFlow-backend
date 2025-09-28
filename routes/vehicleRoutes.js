import express from 'express';
import {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
    getAvailableVehicles,
    assignDriver,
    unassignDriver
} from '../controllers/vehicleController.js';

const router = express.Router();

// Create a new vehicle
router.post('/', createVehicle);

// Get all vehicles with optional filtering and pagination
router.get('/', getAllVehicles);

// Get available vehicles (not assigned to any driver)
router.get('/available', getAvailableVehicles);

// Get vehicle by ID
router.get('/:id', getVehicleById);

// Update vehicle by ID
router.put('/:id', updateVehicle);

// Delete vehicle by ID
router.delete('/:id', deleteVehicle);

// Assign driver to vehicle
router.patch('/:id/assign-driver', assignDriver);

// Unassign driver from vehicle
router.patch('/:id/unassign-driver', unassignDriver);

export default router;
