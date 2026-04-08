const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Credential = require('../models/Credential');
const jwt = require('jsonwebtoken');

// POST /api/profile/sync-abc
router.post('/sync-abc', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
        const user = await User.findById(decoded.id);
        
        if (!user || !user.is_abc_verified || !user.abc_id) {
            return res.status(400).json({ error: 'User is not ABC verified' });
        }

        // Mock fetch latest data from NAD sandbox for this abc_id
        
        user.verified_name = user.verified_name || user.name;
        user.is_scoutable = true; 
        await user.save();
        
        res.json({ message: 'Profile synced from ABC successfully', profile: user });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Failed to sync with ABC' });
    }
});

// GET /api/profile/:user_id
router.get('/:user_id', async (req, res) => {
    try {
        const user = await User.findById(req.params.user_id).select('-__v -password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const credentials_count = await Credential.countDocuments({ userId: req.params.user_id });
        
        res.json({
           user,
           credentials_count
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

module.exports = router;
