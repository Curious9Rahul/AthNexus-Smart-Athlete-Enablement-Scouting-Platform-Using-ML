const mongoose = require('mongoose');

const CredentialSchema = new mongoose.Schema({
  credentialId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: String, required: true },
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  pdfUrl: { type: String, required: true },
  qrCodeUrl: { type: String },
  abcPushStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Credential', CredentialSchema);
