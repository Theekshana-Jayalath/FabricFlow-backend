import Driver from '../models/driver.js'

export async function createDriver(req, res) {
  try {
    const {
      driverId,
      firstName,
      lastName,
      address,
      contact,
      licenseNo,
      nic,
      status,
    } = req.body;

    const newDriver = new Driver({
      driverId,
      firstName,
      lastName,
      address,
      contact,
      licenseNo,
      nic,
      status,
    });

    await newDriver.save();

    res.status(201).json({
      success: true,
      message: "Driver registered successfully",
      data: newDriver,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating driver",
      error: error.message,
    });
  }
}

export async function getAllDrivers(req, res) {
  try {
    const drivers = await Driver.find()
    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching drivers",
      error: error.message,
    });
  }
}

export async function getDriverById(req, res) {
  try {
    const driverId = req.params.driverId; 

    const driver = await Driver.findOne({driverId : driverId});

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching driver",
      error: error.message,
    });
  }
}

export async function deleteDriverById(req, res) {
  try {

    const driverId = req.params.driverId; 
    const driver = await Driver.deleteOne({driverId : driverId});

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver deleted successfully",
      data: driver, // returning deleted driver info
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting driver",
      error: error.message,
    });
  }
}



