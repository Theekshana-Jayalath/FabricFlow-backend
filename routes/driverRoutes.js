import express from 'express';
import {
    getAllDrivers,
    getDriverById
} from '../controllers/driverController.js';

const router = express.Router();

// Get all drivers
router.get('/', getAllDrivers);

// Get driver by ID
router.get('/:id', getDriverById);

export default router;