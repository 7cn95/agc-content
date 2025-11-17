const mongoose = require('mongoose');

const notificationSettingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  enabled: { type: Boolean, default: true },
  daysBeforeExpiry: { type: Number, default: 7 }
}, { timestamps: true });

module.exports = mongoose.model('NotificationSetting', notificationSettingSchema);