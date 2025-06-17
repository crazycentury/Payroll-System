const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const { authRequired } = require('../middleware/authMiddleware');

router.post('/', authRequired, async (req, res) => {
    try {
        const userId = req.user.userId;
        const today = new Date();
        const todayDate = today.toISOString().split('T')[0];
        const { hours } = req.body;

        if (!hours || isNaN(hours) || hours < 0 || hours > 3) {
        return res.status(400).json({ message: 'Overtime hours must be between 0 and 3' });
        }

        // Cek attendance and make sure already clock-out
        const attendance = await db('attendances')
        .where({ user_id: userId, date: todayDate })
        .first();

        
        const day = today.getDay(); // 0 = Sunday, 6 = Saturday
        const isWeekend = (day === 0 || day === 6);

        // Validation for weekdays users must clock out
        if (!isWeekend && (!attendance || !attendance.clock_out)) {
        return res.status(400).json({ message: 'You must clock out before submitting overtime on weekdays' });
        }

        // Check if already request overtime
        const existing = await db('overtimes')
        .where({ user_id: userId, date: todayDate })
        .first();

        if (existing) {
        return res.status(400).json({ message: 'Overtime already submitted for today' });
        }

        // Insert to table
        const [created] = await db('overtimes')
        .insert({
            user_id: userId,
            date: todayDate,
            hours,
            created_by: userId,
            ip_address: req.ip,
            created_at: new Date(),
            updated_at: new Date(),
        })
        .returning('*');

        res.status(201).json({ message: 'Overtime submitted', data: created });
    } catch (err) {
        console.error('Error submitting overtime:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/overtimes?user_id=1&date=2025-06-09
router.get('/', authRequired, async (req, res) => {
    try {
        const { user_id, date } = req.query;

        const query = db('overtimes').select('*');

        if (user_id) {
        query.where('user_id', user_id);
        }

        if (date) {
        query.andWhere('date', date);
        }

        const results = await query.orderBy('date', 'desc');

        res.json({ data: results });
    } catch (err) {
        console.error('Error fetching overtime:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
