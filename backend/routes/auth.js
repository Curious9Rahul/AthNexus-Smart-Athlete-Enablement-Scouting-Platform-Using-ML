const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Start Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Auth Callback
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: `${clientUrl}/auth?error=auth_failed` }),
  (req, res) => {
    // 🔴 Security Gate: Check moderation status before issuing JWT
    if (req.user.status && req.user.status !== 'ACTIVE') {
      const reason = req.user.status === 'BANNED' ? req.user.banReason : req.user.frozenReason;
      const meta = reason ? `&reason=${encodeURIComponent(reason)}` : '';
      return res.redirect(`${clientUrl}/auth?error=account_${req.user.status.toLowerCase()}${meta}`);
    }

    // Generate JWT
    const payload = {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      name: req.user.name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecret', { expiresIn: '7d' });

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.redirect(`${clientUrl}/dashboard`);
  }
);

// Get current user (Verify Token)
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ isAuthenticated: false });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
        const user = await User.findById(decoded.id).select('-__v');
        
        if (!user) return res.status(401).json({ isAuthenticated: false });
        
        // 🔴 Security Gate: Terminate active sessions unconditionally if account isn't ACTIVE
        if (user.status && user.status !== 'ACTIVE') {
            res.clearCookie('token');
            return res.status(403).json({ isAuthenticated: false, error: `Account is ${user.status.toLowerCase()}` });
        }

        res.json({ isAuthenticated: true, user });
    } catch (error) {
        console.error(error);
        res.status(401).json({ isAuthenticated: false, error: 'Invalid Token' });
    }
});

// Update Profile
router.put('/profile', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.profile = req.body;
        await user.save();
        
        res.json({ success: true, user });
    } catch (error) {
        console.error('Failed to update profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
