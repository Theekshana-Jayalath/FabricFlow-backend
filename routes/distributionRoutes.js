import express from 'express';
import { 
  assignDelivery, 
  getAllAssignedOrders, 
  getUnassignedOrders,
  getAvailableDrivers
} from '../controllers/distributionController.js';

const router = express.Router();

// Assign delivery to driver
router.post('/assign', assignDelivery);

// Get all assigned orders with driver details
router.get('/assigned', getAllAssignedOrders);

// Get unassigned orders (SHIPPED orders not yet assigned)
router.get('/unassigned', getUnassignedOrders);

// Get available drivers for assignment
router.get('/available-drivers', getAvailableDrivers);

export default router;