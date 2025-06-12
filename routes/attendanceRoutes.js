const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/authMiddleware');
const db = require('../db/knex');

// CLOCK IN
router.post('/clock-in', authRequired, async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const todayDate = now.toISOString().split('T')[0];
    const day = now.getDay();

    if (day === 0 || day === 6) {
      return res.status(400).json({ message: 'Cannot clock in on weekends' });
    }

    const period = await db('payroll_periods')
      .where('start_date', '<=', todayDate)
      .andWhere('end_date', '>=', todayDate)
      .andWhere('is_processed', false)
      .first();

    if (!period) {
      return res.status(400).json({ message: 'No active payroll period found' });
    }

    const existing = await db('attendances')
      .where({ user_id: userId, date: todayDate })
      .first();

    if (existing?.clock_in) {
      return res.status(400).json({ message: 'Already clocked in today' });
    }

    if (existing) {
      await db('attendances')
        .where({ id: existing.id })
        .update({ clock_in: now, updated_at: new Date() });
    } else {
      await db('attendances').insert({
        user_id: userId,
        date: todayDate,
        clock_in: now,
        created_by: userId,
        ip_address: req.ip,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    res.status(200).json({ message: 'Clock in recorded' });
  } catch (err) {
    console.error('Error on clock-in:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// CLOCK OUT
router.post('/clock-out', authRequired, async (req, res) => {
  try {
    const userId = req.user.userId;
    const todayDate = new Date().toISOString().split('T')[0];

    const record = await db('attendances')
      .where({ user_id: userId, date: todayDate })
      .first();

    if (!record) {
      return res.status(400).json({ message: 'You must clock in before clocking out' });
    }

    if (record.clock_out) {
      return res.status(400).json({ message: 'Already clocked out today' });
    }

    const now = new Date();
    const clockInTime = new Date(record.clock_in);
    const diffMs = now - clockInTime;
    const diffMinutes = Math.floor(diffMs / 60000);

    // Skip 8-hour check if test=true
    const isTestMode = req.query.test === 'true';
    if (!isTestMode && diffMinutes < 480) {
      return res.status(400).json({ message: 'Minimum work time is 8 hours (480 minutes)' });
    }

    const [updated] = await db('attendances')
      .where({ id: record.id })
      .update({
        clock_out: now,
        updated_at: new Date(),
      })
      .returning('*');

    res.status(200).json({ message: 'Clock-out successful', data: updated });
  } catch (err) {
    console.error('Error during clock-out:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
