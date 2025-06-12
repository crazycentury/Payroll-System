const express = require('express');
const router = express.Router();
const { authRequired, adminOnly } = require('../middleware/authMiddleware');
const db = require('../db/knex'); // atau sesuai dengan koneksi knex kamu
const dayjs = require('dayjs');

// endpoint POST /api/payroll-periods
// admin set payroll periods, insert start_date and end_date
router.post('/', authRequired, adminOnly, async (req, res) => {
    try {
        const { start_date, end_date } = req.body;

        // validation start_date and end_date must have value
        if (!start_date || !end_date) {
            return res.status(400).json({ message: 'start_date and end_date are required' });
        }

        // check if the values overlap
        const existing = await db('payroll_periods')
            .whereBetween('start_date', [start_date, end_date])
            .orWhereBetween('end_date', [start_date, end_date]);

        // validation cannot overlap
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Overlapping payroll period exists' });
        }

        // Insert periode
        const [created] = await db('payroll_periods')
        .insert({
            start_date,
            end_date,
            created_by: req.user.userId,
            created_at: new Date(),
            updated_at: new Date(),
        })
        .returning('*');

        const formatted = {
          ...created,
          start_date: dayjs(created.start_date).format('YYYY-MM-DD'),
          end_date: dayjs(created.end_date).format('YYYY-MM-DD'),
        };

        res.status(201).json({ message: 'Payroll period created', data: formatted });
    } catch (err) {
        console.error('Error creating payroll period:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/payroll-periods
router.get('/', authRequired, adminOnly, async (req, res) => {
  try {
    const periods = await db('payroll_periods')
      .select('id', 'start_date', 'end_date', 'is_processed', 'created_by', 'created_at', 'updated_at')
      .orderBy('start_date', 'desc');

    res.status(200).json({ data: periods });
  } catch (err) {
    console.error('Error fetching payroll periods:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
