const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const { authRequired } = require('../middleware/authMiddleware');

router.post('/', authRequired, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, description } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];

    const [created] = await db('reimbursements')
      .insert({
        user_id: userId,
        date: todayDate,
        amount,
        description,
        created_by: userId,
        ip_address: req.ip,
        created_at: new Date(),
        updated_at: new Date(),
        updated_by: userId
      })
      .returning('*');

    res.status(201).json({ message: 'Reimbursement submitted', data: created });
  } catch (err) {
    console.error('Error submitting reimbursement:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET reimbursements (with optional filters)
router.get('/', authRequired, async (req, res) => {
    try {
        const { user_id, date } = req.query;

        let query = db('reimbursements');

        if (user_id) {
        query = query.where('user_id', user_id);
        }

        if (date) {
        query = query.andWhere('date', date);
        }

        const results = await query.orderBy('date', 'desc');

        res.status(200).json({ data: results });
    } catch (err) {
        console.error('Error fetching reimbursements:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
