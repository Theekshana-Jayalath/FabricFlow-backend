import Order from '../models/orderModel.js';

// Create a new order
// ...existing code...

export const createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        
        // Check if the input is an array
        if (Array.isArray(orderData)) {
            // Handle bulk creation
            const orders = await Order.insertMany(orderData);
            res.status(201).json({
                success: true,
                message: 'Orders created successfully',
                data: orders
            });
        } else {
            // Handle single order creation
            const order = new Order(orderData);
            await order.save();
            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: order
            });
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ...existing code...

// Get all orders with filtering options
export const getOrders = async (req, res) => {
    try {
        const {
            customer,
            startDate,
            endDate,
            status,
            page = 1,
            limit = 10
        } = req.query;

        // Build filter object
        const filter = {};
        if (customer) filter['customer.name'] = new RegExp(customer, 'i');
        if (status) filter.orderStatus = status.toUpperCase();
        if (startDate && endDate) {
            filter.orderDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const orders = await Order.find(filter)
            .sort({ orderDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            orders,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get orders by customer email
export const getCustomerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 'customer.email': req.params.email })
            .sort({ orderDate: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Find the order first
        const order = await Order.findOne({ orderId: id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if order can be updated based on its status
        if (updates.orderStatus === 'CANCELLED' && order.orderStatus === 'SHIPPED') {
            return res.status(400).json({ 
                message: 'Cannot cancel order after shipping' 
            });
        }

        // If customer is trying to update
        if (req.user && req.user.role === 'customer') {
            if (order.orderStatus !== 'PENDING') {
                return res.status(400).json({ 
                    message: 'Can only update pending orders' 
                });
            }
            // Limit what customers can update
            const allowedUpdates = ['shippingAddress'];
            Object.keys(updates).forEach(key => {
                if (!allowedUpdates.includes(key)) {
                    delete updates[key];
                }
            });
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { orderId: id },
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete order
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findOne({ orderId: id });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only allow deletion of non-shipped orders
        if (order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED') {
            return res.status(400).json({
                message: 'Cannot delete shipped or delivered orders'
            });
        }

        await Order.findOneAndDelete({ orderId: id });
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findOne({ orderId: id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Validate status transition
        const validTransitions = {
            'PENDING': ['PROCESSING', 'CANCELLED'],
            'PROCESSING': ['SHIPPED', 'CANCELLED'],
            'SHIPPED': ['DELIVERED'],
            'DELIVERED': [],
            'CANCELLED': []
        };

        if (!validTransitions[order.orderStatus].includes(status)) {
            return res.status(400).json({
                message: `Invalid status transition from ${order.orderStatus} to ${status}`
            });
        }

        order.orderStatus = status;
        await order.save();

        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        const order = await Order.findOneAndUpdate(
            { orderId: id },
            { paymentStatus },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
