import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    getCustomerOrders,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    updatePaymentStatus,
    getAssignedOrders
} from '../controllers/orderControl.js';

const router = express.Router();

// Create a new order
router.post('/', createOrder);

// Get all orders with filtering
router.get('/', getOrders);

// Get specific order by ID
router.get('/:id', getOrderById);

// Get orders by customer email
router.get('/customer/:email', getCustomerOrders);

// Update order
router.put('/:id', updateOrder);

// Delete order
router.delete('/:id', deleteOrder);

// Update order status
router.patch('/:id/status', updateOrderStatus);

// Update payment status
router.patch('/:id/payment', updatePaymentStatus);

// Get assigned orders
router.get('/assigned/drivers', getAssignedOrders);

export default router;
