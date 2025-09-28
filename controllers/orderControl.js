import Order from '../models/orderModel.js';

// Helper function to calculate delivery date
const calculateDeliveryDate = (orderDate) => {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 7);
    return date;
};

// Create a new order
export const createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        
        // Check if the input is an array
        if (Array.isArray(orderData)) {
            // Handle bulk creation
            const processedOrders = orderData.map(order => {
                // Set delivery date if not provided
                if (!order.deliveryDate && order.orderDate) {
                    order.deliveryDate = calculateDeliveryDate(order.orderDate);
                }
                return order;
            });
            
            const orders = await Order.insertMany(processedOrders);
            res.status(201).json({
                success: true,
                message: 'Orders created successfully',
                data: orders
            });
        } else {
            // Handle single order creation
            // Set delivery date if not provided
            if (!orderData.deliveryDate && orderData.orderDate) {
                orderData.deliveryDate = calculateDeliveryDate(orderData.orderDate);
            }
            
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

// Get all orders with filtering options and auto-update expired orders
export const getOrders = async (req, res) => {
    try {
        // Auto-update expired orders before fetching
        await Order.updateExpiredOrders();
        
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

// Get a single order by ID and auto-complete if eligible
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Check if order should be auto-completed
        await order.autoCompleteIfEligible();
        
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
            
        // Auto-complete eligible orders
        for (let order of orders) {
            await order.autoCompleteIfEligible();
        }
        
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

        console.log('Updating order:', id);
        console.log('Update data:', updates);

        // Find the order first
        const order = await Order.findOne({ orderId: id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if order should be auto-completed first
        await order.autoCompleteIfEligible();

        // If order date is being updated, recalculate delivery date
        if (updates.orderDate) {
            updates.deliveryDate = calculateDeliveryDate(updates.orderDate);
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

        // Handle nested customer updates properly
        if (updates.customer) {
            // Merge with existing customer data to avoid overwriting required fields
            updates.customer = {
                ...order.customer.toObject(),
                ...updates.customer
            };

            // Handle shipping address merge
            if (updates.customer.shippingAddress) {
                updates.customer.shippingAddress = {
                    ...order.customer.shippingAddress.toObject(),
                    ...updates.customer.shippingAddress
                };
            }
        }

        // Remove empty string values to prevent validation errors
        const cleanUpdates = {};
        Object.keys(updates).forEach(key => {
            if (updates[key] !== '' && updates[key] !== null && updates[key] !== undefined) {
                cleanUpdates[key] = updates[key];
            }
        });

        console.log('Clean updates:', cleanUpdates);

        const updatedOrder = await Order.findOneAndUpdate(
            { orderId: id },
            { $set: cleanUpdates },
            { 
                new: true, 
                runValidators: true,
                context: 'query' // This helps with validation context
            }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found during update' });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Update error:', error);
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

        // Check if order should be auto-completed first
        await order.autoCompleteIfEligible();

        // Validate status transition
        const validTransitions = {
            'PROCESSING': ['COMPLETED', 'CANCELLED', 'SHIPPED'],
            'COMPLETED': ['SHIPPED'],
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
        order.statusUpdateDate = new Date();
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

// Manually trigger order status updates (can be called by a cron job)
export const updateExpiredOrders = async (req, res) => {
    try {
        const result = await Order.updateExpiredOrders();
        res.status(200).json({
            success: true,
            message: `Updated ${result.modifiedCount} orders to COMPLETED status`,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};