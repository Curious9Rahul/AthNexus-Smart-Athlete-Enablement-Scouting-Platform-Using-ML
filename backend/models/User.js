const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['player', 'verifier', 'admin'], default: 'player' },
  profilePicture: { type: String },
  profile: { type: Object, default: null }, // Simple way to store the player profile for now
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
