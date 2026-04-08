const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['player', 'verifier', 'admin'], default: 'player' },
  profilePicture: { type: String },
  profile: { type: Object, default: null }, // Simple way to store the player profile for now
  
  // Moderation / Management Info
  status: { type: String, enum: ['ACTIVE', 'BANNED', 'FROZEN'], default: 'ACTIVE' },
  bannedAt: { type: Date, default: null },
  banReason: { type: String, default: null },
  frozenAt: { type: Date, default: null },
  frozenReason: { type: String, default: null },

  // ABC / APAAR Verification
  abc_id: { type: String, default: null },
  verified_name: { type: String, default: null },
  verified_college: { type: String, default: null },
  verified_dob: { type: Date, default: null },
  is_abc_verified: { type: Boolean, default: false },
  is_scoutable: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
