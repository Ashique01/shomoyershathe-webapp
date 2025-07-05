const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const HealthEntry = require('../models/HealthEntry');

// GET health entries for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const entries = await HealthEntry.find({ userId }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    console.error('GET /health/:userId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST new health entry for a user
router.post('/', async (req, res) => {
  try {
    const { userId, date, bp, sugar, weight } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const newEntry = new HealthEntry({ userId, date, bp, sugar, weight });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    console.error('POST /health error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE a health entry by MongoDB _id
router.delete('/entry/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid entry ID' });
    }

    const deletedEntry = await HealthEntry.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted successfully', id });
  } catch (err) {
    console.error('DELETE /health/entry/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
