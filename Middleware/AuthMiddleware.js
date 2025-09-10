import jwt from 'jsonwebtoken';
import User from '../Model/UserModel.js';
import Employee from '../Model/EmployeeModel.js';

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided or invalid format.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user in User or Employee collection
    let user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      user = await Employee.findById(decoded.userId).select('-password');
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.'
      });
    }

    // Add user to request object
    req.user = user;
    req.userType = user.role || (user.empId ? 'employee' : 'user');
    
    next();
    
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired. Please log in again.'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'An error occurred while verifying token.'
    });
  }
};

// Middleware to check if user is admin
const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while verifying admin privileges.'
    });
  }
};

// Middleware to check if user is employee or admin
const verifyEmployeeOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    if (req.user.role !== 'employee' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Employee or Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Employee/Admin verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while verifying privileges.'
    });
  }
};

export { verifyToken, verifyAdmin, verifyEmployeeOrAdmin };
