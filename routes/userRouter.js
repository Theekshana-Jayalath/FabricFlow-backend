import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, role: 'user' }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new user (fallback if not using auth/register)
router.post('/', async (req, res) => {
    try {
        const userData = { ...req.body, role: 'user' };
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        } else {
            // Default password if none provided
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash('password123', salt);
        }
        
        const newUser = new User(userData);
        const savedUser = await newUser.save();
        
        const userObj = savedUser.toObject();
        delete userObj.password;
        
        res.status(201).json(userObj);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        // Don't allow changing role or directly changing password through this route
        delete updateData.role;
        delete updateData.password;

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'user' },
            { $set: updateData },
            { new: true }
        ).select('-password');
        
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await User.findOneAndDelete({ _id: req.params.id, role: 'user' });
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;