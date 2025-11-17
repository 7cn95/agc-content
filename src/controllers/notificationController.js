const { body, validationResult } = require('express-validator');
const { Expo } = require('expo-server-sdk');
const DeviceToken = require('../models/DeviceToken');
const NotificationSetting = require('../models/NotificationSetting');
const Line = require('../models/Line');
const { classifyStatus } = require('../utils/dateUtils');

const expo = new Expo();

exports.tokenValidators = [
  body('expoPushToken').notEmpty()
];

exports.registerToken = async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { expoPushToken, platform } = req.body;
  try {
    if (!Expo.isExpoPushToken(expoPushToken)) {
      return res.status(400).json({ message: 'Invalid Expo token' });
    }
    let doc = await DeviceToken.findOne({ expoPushToken });
    if (!doc) {
      doc = await DeviceToken.create({ user: req.user._id, expoPushToken, platform: platform || 'unknown' });
    } else {
      doc.user = req.user._id;
      doc.platform = platform || doc.platform;
      await doc.save();
    }
    res.json({ message: 'Token registered' });
  } catch (e) {
    console.error('registerToken', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSettings = async (req,res) => {
  try {
    let s = await NotificationSetting.findOne({ user: req.user._id });
    if (!s) s = await NotificationSetting.create({ user: req.user._id });
    res.json(s);
  } catch (e) {
    console.error('getSettings', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSettingsValidators = [
  body('enabled').optional().isBoolean(),
  body('daysBeforeExpiry').optional().isInt({ min:1, max:365 })
];

exports.updateSettings = async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { enabled, daysBeforeExpiry } = req.body;
  try {
    let s = await NotificationSetting.findOne({ user: req.user._id });
    if (!s) s = new NotificationSetting({ user: req.user._id });
    if (enabled !== undefined) s.enabled = enabled;
    if (daysBeforeExpiry !== undefined) s.daysBeforeExpiry = daysBeforeExpiry;
    await s.save();
    res.json(s);
  } catch (e) {
    console.error('updateSettings', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.triggerExpiring = async (req,res) => {
  try {
    const s = await NotificationSetting.findOne({ user: req.user._id });
    if (!s || !s.enabled) return res.status(400).json({ message: 'Notifications disabled' });
    const days = s.daysBeforeExpiry || 7;
    const today = new Date(); today.setHours(0,0,0,0);

    const lines = await Line.find();
    const soon = [];
    const expired = [];
    for (const l of lines) {
      const st = classifyStatus(l.expiryDate);
      const diffDays = (new Date(l.expiryDate) - today)/(1000*60*60*24);
      if (st === 'EXPIRED') expired.push(l);
      else if (diffDays >= 0 && diffDays <= days) soon.push(l);
    }

    const tokens = await DeviceToken.find({ user: req.user._id });
    if (!tokens.length) return res.status(400).json({ message: 'No device tokens' });

    const body = `قرب انتهاء ${soon.length} خط/خطوط، و ${expired.length} منتهية.`;
    const messages = tokens.filter(t => Expo.isExpoPushToken(t.expoPushToken)).map(t => ({
      to: t.expoPushToken,
      sound: 'default',
      title: 'AGC Content – تنبيه الباقات',
      body,
      data: { type: 'lines_expiring' }
    }));

    const chunks = expo.chunkPushNotifications(messages);
    for (const c of chunks) {
      try { await expo.sendPushNotificationsAsync(c); }
      catch (e) { console.error('expo send error', e); }
    }
    res.json({ message: 'Notifications queued', soon: soon.length, expired: expired.length });
  } catch (e) {
    console.error('triggerExpiring', e);
    res.status(500).json({ message: 'Server error' });
  }
};