const { body, validationResult } = require('express-validator');
const Line = require('../models/Line');
const { classifyStatus, renewForOneMonth } = require('../utils/dateUtils');
const { importLinesFromCsv } = require('../services/lineCsvService');
exports.validators = [
  body('personName').notEmpty(),
  body('phoneNumber').notEmpty(),
  body('expiryDate').notEmpty()
];

exports.getAll = async (req,res) => {
  try {
    const lines = await Line.find().sort({ expiryDate: 1 });
    const data = lines.map(l => ({
      id: l._id,
      personName: l.personName,
      phoneNumber: l.phoneNumber,
      jobTitle: l.jobTitle,
      workplace: l.workplace,
      packageAmount: l.packageAmount,
      expiryDate: l.expiryDate,
      status: classifyStatus(l.expiryDate)
    }));
    res.json(data);
  } catch (e) {
    console.error('getAll', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOne = async (req,res) => {
  try {
    const line = await Line.findById(req.params.id);
    if (!line) return res.status(404).json({ message: 'Not found' });
    res.json(line);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
};

exports.create = async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const line = await Line.create(req.body);
    res.status(201).json(line);
  } catch (e) {
    console.error('create', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req,res) => {
  try {
    const line = await Line.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!line) return res.status(404).json({ message: 'Not found' });
    res.json(line);
  } catch (e) {
    console.error('update', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req,res) => {
  try {
    const line = await Line.findByIdAndDelete(req.params.id);
    if (!line) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error('delete', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.renew = async (req,res) => {
  try {
    const line = await Line.findById(req.params.id);
    if (!line) return res.status(404).json({ message: 'Not found' });
    line.expiryDate = renewForOneMonth(line.expiryDate);
    await line.save();
    res.json(line);
  } catch (e) {
    console.error('renew', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.importCsv = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'file required' });

  try {
    const inserted = await importLinesFromCsv(req.file.buffer);
    res.json({ message: `Imported ${inserted} lines` });
  } catch (e) {
    console.error('importCsv', e);
    res.status(500).json({ message: 'Server error' });
  }
};
