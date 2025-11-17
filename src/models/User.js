const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','user'], default: 'admin' }
}, { timestamps: true });

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.seedAdminIfNeeded = async function () {
  const count = await this.countDocuments();
  if (count === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await this.create({ username: 'admin', passwordHash: hash, role: 'admin' });
    console.log('Seeded admin: admin / admin123');
  }
};

module.exports = mongoose.model('User', userSchema);