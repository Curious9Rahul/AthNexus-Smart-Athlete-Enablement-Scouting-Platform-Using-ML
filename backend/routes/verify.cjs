const express = require('express');
const router = express.Router();
const Credential = require('../models/Credential');

// GET /api/verify/:credential_id
router.get('/:credential_id', async (req, res) => {
    try {
        const credential = await Credential.findOne({ credentialId: req.params.credential_id }).populate('userId', 'verified_name name');
        if (!credential) {
            return res.json({ valid: false });
        }
        
        res.json({
            valid: true,
            athlete_name: credential.userId.verified_name || credential.userId.name,
            event_name: credential.eventName,
            issued_at: credential.issuedAt,
            pdf_url: credential.pdfUrl
        });
    } catch (error) {
        res.status(500).json({ error: 'Verification error' });
    }
});

module.exports = router;
