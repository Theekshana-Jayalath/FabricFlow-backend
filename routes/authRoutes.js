import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { role, password, ...restData } = req.body;

    // Normalize data based on role
    let email = restData.gmail || restData.emailAddress;
    let name = restData.name || restData.empName;
    let phone = restData.phone || restData.empPhone;

    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      role,
      password: hashedPassword,
      name,
      email,
      phone,
      age: restData.age,
      address: restData.address,
      gender: restData.gender,
      dob: restData.dob,
      empId: restData.empId,
      jobPosition: restData.jobPosition,
      status: restData.status
    });

    const savedUser = await newUser.save();

    // Generate token
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1d' }
    );

    // Return user without password
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, user: userResponse, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    // Check role if specified
    if (role && user.role !== role) {
      return res.status(403).json({ success: false, error: `Access denied. Not an ${role}` });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1d' }
    );

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ success: true, user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
});
// Google OAuth Login/Register
router.post('/google-oauth', async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required for Google login' });
    }

    let user = await User.findOne({ email });
    
    // If user doesn't exist, create a new one as customer
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(googleId || 'google_oauth_fallback_pass', salt);
      
      user = new User({
        role: 'customer',
        name: name || 'Google User',
        email,
        password: hashedPassword,
        status: 'Active'
      });
      await user.save();
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ success: true, user: userResponse, token });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ success: false, error: 'Server error during Google OAuth' });
  }
});

// Change Password (Requires old password)
router.post('/change-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect old password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Manual Change Password (Admin/Forgot Password flow)
router.post('/manual-change-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email and new password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Manual change password error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;