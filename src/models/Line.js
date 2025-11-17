const mongoose = require('mongoose');

const lineSchema = new mongoose.Schema({
  personName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  jobTitle: { type: String, trim: true },
  workplace: { type: String, trim: true },
  packageAmount: { type: Number },
  expiryDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Line', lineSchema);