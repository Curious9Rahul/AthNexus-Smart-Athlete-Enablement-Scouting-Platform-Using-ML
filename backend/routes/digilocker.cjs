const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// POST /api/auth/digilocker/init
router.post('/init', async (req, res) => {
    const state = Math.random().toString(36).substring(7);
    res.cookie('oauth_state', state, { httpOnly: true, maxAge: 900000 });
    
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    let redirectUrl = `${clientUrl}/dashboard?digilocker_code=sandbox_code_123&state=${state}`;

    // If real credentials are provided in .env, redirect to actual DigiLocker login
    if (process.env.DIGILOCKER_CLIENT_ID) {
        // This is the standard OAuth request URL (similar to Google/LinkedIn)
        redirectUrl = `https://api.digitallocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${process.env.DIGILOCKER_CLIENT_ID}&state=${state}&redirect_uri=http://localhost:5000/api/auth/digilocker/callback`;
    }
    
    res.json({ url: redirectUrl });
});

// GET /api/auth/digilocker/callback
router.get('/callback', async (req, res) => {
    const { code, state } = req.query;
    
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
        const user = await User.findById(decoded.id);
        
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // Fetch data from NAD Sandbox directly or do real Token Exchange
        let platformData = {};

        // If real credentials exist AND we actually got a real code from DigiLocker
        if (process.env.DIGILOCKER_CLIENT_ID && code && code !== 'sandbox_code_123') {
            // 1. Exchange the Authorization Code for an Access Token
            const tokenParams = new URLSearchParams();
            tokenParams.append('grant_type', 'authorization_code');
            tokenParams.append('code', code);
            tokenParams.append('client_id', process.env.DIGILOCKER_CLIENT_ID);
            tokenParams.append('client_secret', process.env.DIGILOCKER_CLIENT_SECRET);
            tokenParams.append('redirect_uri', 'http://localhost:5000/api/auth/digilocker/callback');

            const tokenRes = await fetch('https://api.digitallocker.gov.in/public/oauth2/1/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: tokenParams.toString()
            });
            const tokenData = await tokenRes.json();
            
            if (!tokenData.access_token) {
                return res.status(400).json({ error: 'Failed to retrieve DigiLocker access token' });
            }

            // 2. Use Access Token to fetch the user's Verified Profile Data
            const profileRes = await fetch('https://api.digitallocker.gov.in/public/oauth2/2/user', {
                headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
            });
            const profileData = await profileRes.json();
            
            platformData = {
                abc_id: profileData.reference_key || `ABC-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
                name: profileData.name || user.name,
                college: profileData.college_name || "Verified University",
                dob: profileData.dob ? new Date(profileData.dob) : new Date("2000-01-01")
            };
        } else {
            // MOCK OAUTH LOGIC (Sandbox fallback if keys are missing or test code passed)
            platformData = {
               abc_id: `ABC-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
               name: user.name, 
               college: "Somaiya Vidyavihar University", // Dummy college name
               dob: new Date("2002-05-15")
            };
        }
        
        user.abc_id = platformData.abc_id;
        user.verified_name = platformData.name;
        user.verified_college = platformData.college;
        user.verified_dob = platformData.dob;
        user.is_abc_verified = true;
        user.is_scoutable = true;
        
        await user.save();
        
        // OAuth flow completes in the browser window, so we must redirect the user back to the React app
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/dashboard?verified=success`);
    } catch (error) {
        console.error('DigiLocker error:', error);
        // Redirect back with an error flag
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/dashboard?verified=error`);
    }
});

module.exports = router;
