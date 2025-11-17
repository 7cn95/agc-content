const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');

exports.loginValidators = [
  body('username').notEmpty(),
  body('password').notEmpty()
];

exports.login = async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { username, password } = req.body;
  try {
    await User.seedAdminIfNeeded();
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (e) {
    console.error('login error', e);
    res.status(500).json({ message: 'Server error' });
  }
};