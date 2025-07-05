const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// GET reminders for a specific user
router.get('/', async (req, res) => {
  try {
    const { userId } =  req.query;;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const reminders = await Reminder.find({ userId: String(userId) }).sort({ time: 1 }).lean();
    res.json(reminders);
  } catch (err) {
    console.error('GET /reminders/:userId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST new reminder for a user
router.post('/', async (req, res) => {
  try {
    const { userId, medicineName, time } = req.body;
    if (!userId || !medicineName || !time) {
      return res.status(400).json({ error: 'userId, medicineName and time are required' });
    }

    const reminder = new Reminder({ userId, medicineName, time });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    console.error('POST /reminders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update reminder by id (no userId check needed here)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('PUT /reminders/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE reminder by id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Reminder.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('DELETE /reminders/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
