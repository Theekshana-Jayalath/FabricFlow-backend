import Distribution from '../models/DistributionModel.js';
import Order from '../models/orderModel.js';
import Employee from '../Model/EmployeeModel.js'; // Changed from Driver to Employee

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

    // Check if driver exists and is actually a driver
    const driver = await Employee.findById(driverId);
    if (!driver) return res.status(404).json({ message: 'Employee not found.' });
    
    // Verify that the employee is a driver
    if (driver.role !== 'employee' || !driver.jobPosition.match(/^driver$/i)) {
      return res.status(400).json({ message: 'Selected employee is not a driver.' });
    }
    
    // Check if driver is active
    if (driver.status !== 'active') {
      return res.status(400).json({ message: 'Driver is not active.' });
    }

    // Check if order is already assigned to any driver
    const existingAssignment = await Distribution.findOne({ order: orderId });
    if (existingAssignment) {
      return res.status(400).json({ 
        message: 'This order is already assigned to a driver.',
        assignedDriver: existingAssignment.driver
      });
    }

    // Check if driver is already assigned to another order (optional - you can remove this if needed)
    const driverBusy = await Distribution.findOne({ 
      driver: driverId, 
      deliveryStatus: { $in: ['ASSIGNED', 'IN_TRANSIT'] } 
    });
    if (driverBusy) {
      return res.status(400).json({ 
        message: 'This driver is already assigned to another order.' 
      });
    }

    // Create distribution record
    const distribution = new Distribution({
      distributionId: `DIST-${Date.now()}`,
      order: orderId,
      driver: driverId,
      assignedBy,
      notes,
    });
    await distribution.save();

    // Update order status to ASSIGNEDTODRIVER
    try {
      await Order.findByIdAndUpdate(orderId, { orderStatus: 'ASSIGNEDTODRIVER' });
    } catch (e) {
      // Do not fail assignment if status update fails, but report in response
      console.error('Failed to update order status to ASSIGNEDTODRIVER', e);
    }

    // Populate the response with order and driver details
    const populatedDistribution = await Distribution.findById(distribution._id)
      .populate('order', 'orderId customer totalAmount orderStatus orderDate')
      .populate('driver', 'empId empName empPhone jobPosition status address emailAddress'); // Changed to employee fields

    return res.status(201).json({ 
      message: 'Delivery assigned successfully.', 
      data: populatedDistribution 
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all assigned orders with driver details
export const getAllAssignedOrders = async (req, res) => {
  try {
    const {
      status,
      driverId,
      assignedBy,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};
    if (status) filter.deliveryStatus = status.toUpperCase();
    if (driverId) filter.driver = driverId;
    if (assignedBy) filter.assignedBy = new RegExp(assignedBy, 'i');
    if (startDate && endDate) {
      filter.assignedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const distributions = await Distribution.find(filter)
      .populate('order', 'orderId customer totalAmount orderStatus orderDate items')
      .populate('driver', 'empId empName empPhone jobPosition status address emailAddress') // Changed to employee fields
      .sort({ assignedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Distribution.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        distributions,
        total,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned orders',
      error: error.message
    });
  }
};

// Get unassigned orders (SHIPPED orders not yet assigned to drivers)
export const getUnassignedOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Find orders that are SHIPPED but not yet assigned to drivers
    const shippedOrders = await Order.find({ orderStatus: 'SHIPPED' })
      .populate('items.productId', 'name description')
      .sort({ orderDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get assigned order IDs
    const assignedOrderIds = await Distribution.distinct('order');
    
    // Filter out already assigned orders
    const unassignedOrders = shippedOrders.filter(order => 
      !assignedOrderIds.includes(order._id.toString())
    );

    const total = await Order.countDocuments({ orderStatus: 'SHIPPED' }) - assignedOrderIds.length;

    res.status(200).json({
      success: true,
      data: {
        orders: unassignedOrders,
        total,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unassigned orders',
      error: error.message
    });
  }
};

// Get available drivers for distribution (active employees with jobPosition: driver)
export const getAvailableDrivers = async (req, res) => {
  try {
    // Find active employees who are drivers
    const availableDrivers = await Employee.find({
      role: "employee",
      jobPosition: { $regex: /^driver$/i },
      status: "active"
    }).select('-password'); // Exclude password

    if (!availableDrivers || availableDrivers.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "No available drivers found" 
      });
    }

    // Optionally, filter out drivers who are currently busy (assigned to orders that are not yet delivered)
    const busyDriverIds = await Distribution.find({ 
      deliveryStatus: { $in: ['ASSIGNED', 'IN_TRANSIT'] } 
    }).distinct('driver');

    const freeDrivers = availableDrivers.filter(driver => 
      !busyDriverIds.some(busyId => busyId.toString() === driver._id.toString())
    );

    return res.status(200).json({ 
      success: true,
      data: {
        allDrivers: availableDrivers,
        freeDrivers: freeDrivers,
        totalDrivers: availableDrivers.length,
        freeDriversCount: freeDrivers.length,
        busyDriversCount: availableDrivers.length - freeDrivers.length
      }
    });
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching available drivers',
      error: error.message
    });
  }
};

