const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expoPushToken: { type: String, required: true, unique: true },
  platform: { type: String, default: 'unknown' }
}, { timestamps: true });

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);