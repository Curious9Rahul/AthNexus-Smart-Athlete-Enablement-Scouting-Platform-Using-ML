const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Credential = require('../models/Credential');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const certsDir = path.join(__dirname, '..', 'media', 'certs');
if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
}

// POST /api/credentials/issue
router.post('/issue', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
        
        const { user_id, event_id, event_name, event_date } = req.body;
        
        const user = await User.findById(user_id);
        if (!user || !user.is_abc_verified) {
             return res.status(400).json({ error: 'User not verified by ABC' });
        }
        
        const existing = await Credential.findOne({ userId: user_id, eventId: event_id });
        if (existing) {
             return res.status(409).json({ error: 'Credential already issued for this event' });
        }
        
        const credentialId = uuidv4();
        const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${credentialId}`;
        
        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
        
        const pdfFileName = `${credentialId}.pdf`;
        const pdfPath = path.join(certsDir, pdfFileName);
        
        // Create PDF
        const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);
        
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
        
        doc.fontSize(40).fillColor('#84cc16').text('AthNexus Certificate of Participation', { align: 'center' });
        doc.moveDown();
        doc.fontSize(20).fillColor('#000000').text('This is to certify that', { align: 'center' });
        doc.moveDown();
        doc.fontSize(30).fillColor('#0f172a').text(user.verified_name || user.name, { align: 'center' });
        doc.moveDown();
        doc.fontSize(20).fillColor('#000000').text(`has successfully participated in ${event_name}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).fillColor('#64748b').text(`Event Date: ${new Date(event_date).toLocaleDateString()}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).fillColor('#94a3b8').text(`Credential ID: ${credentialId}`, { align: 'center' });
        doc.text(`Issued At: ${new Date().toISOString()}`, { align: 'center' });
        
        // Embed QR code
        const qrImageBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
        doc.image(qrImageBuffer, doc.page.width / 2 - 50, doc.page.height - 150, { width: 100 });
        
        doc.end();
        
        const pdfUrl = `/media/certs/${pdfFileName}`;
        
        // Wait for PDF to save
        await new Promise(resolve => writeStream.on('finish', resolve));
        
        // Mock ABC Wallet Push
        const abcPushStatus = 'success';
        
        const credential = new Credential({
            credentialId,
            userId: user_id,
            eventId: event_id,
            eventName: event_name,
            eventDate: new Date(event_date),
            pdfUrl,
            qrCodeUrl: qrCodeDataUrl,
            abcPushStatus
        });
        
        await credential.save();
        
        res.json({ credential_id: credentialId, pdf_url: pdfUrl, abc_push_status: abcPushStatus });
    } catch (error) {
        console.error('Credential generation failed:', error);
        res.status(500).json({ error: 'Certificate generation failed' });
    }
});

// GET /api/credentials/:user_id - Get all credentials for a user
router.get('/:user_id', async (req, res) => {
    try {
        const credentials = await Credential.find({ userId: req.params.user_id }).sort({ issuedAt: -1 });
        res.json(credentials);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch credentials' });
    }
});

module.exports = router;
