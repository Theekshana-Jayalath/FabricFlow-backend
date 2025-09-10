import Distribution from '../models/DistributionModel.js';
import Order from '../models/orderModel.js';
import Driver from '../models/driver.js';

// Assign a delivery order to a driver
export const assignDelivery = async (req, res) => {
  try {
    const { orderId, driverId, assignedBy, notes } = req.body;
    if (!orderId || !driverId || !assignedBy) {
      return res.status(400).json({ message: 'orderId, driverId, and assignedBy are required.' });
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Check if driver exists
    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: 'Driver not found.' });

    // Create distribution record
    const distribution = new Distribution({
      distributionId: `DIST-${Date.now()}`,
      order: orderId,
      driver: driverId,
      assignedBy,
      notes,
    });
    await distribution.save();

    return res.status(201).json({ message: 'Delivery assigned successfully.', data: distribution });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Optionally: get all deliveries, get by driver, get by order, update status, etc.
