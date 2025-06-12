// routes/payslipRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const { authRequired, adminOnly } = require('../middleware/authMiddleware');

// GET /api/payslips?user_id=&payroll_period_id=
router.get('/', authRequired, async (req, res) => {
    try {
        const requesterId = req.user.userId;
        const isAdmin = req.user.isAdmin;

        const { user_id, payroll_period_id } = req.query;

        // Validasi payroll_period_id
        if (!payroll_period_id) {
        return res.status(400).json({ message: 'payroll_period_id is required' });
        }

        // Tentukan userId target
        const targetUserId = user_id ? parseInt(user_id) : requesterId;

        // Jika non-admin mencoba akses user lain → tolak
        if (!isAdmin && targetUserId !== requesterId) {
        return res.status(403).json({ message: 'You are not allowed to view other user\'s payslip' });
        }

        // Ambil payslip
        const payslip = await db('payslips')
        .where({ user_id: targetUserId, payroll_period_id })
        .first();

        if (!payslip) {
        return res.status(404).json({ message: 'Payslip not found' });
        }

        // Ambil data user & periode
        const user = await db('users').where({ id: targetUserId }).first();
        const period = await db('payroll_periods').where({ id: payroll_period_id }).first();

        // Ambil daftar reimbursements
        const reimbursements = await db('reimbursements')
        .where({ user_id: targetUserId })
        .andWhereBetween('date', [period.start_date, period.end_date])
        .select('id', 'date', 'amount', 'description');

        // Breakdown lembur
        const hourlyRate = user.salary / (payslip.total_attendance_days > 0
        ? payslip.prorated_salary / user.salary * payslip.total_attendance_days * 8 // estimasi
        : 1); // fallback

        const breakdown = {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        period: {
            id: period.id,
            start_date: period.start_date,
            end_date: period.end_date,
        },
        attendance: {
            total_days_present: payslip.total_attendance_days,
            prorated_salary: payslip.prorated_salary,
        },
        overtime: {
            total_hours: payslip.total_overtime_hours,
            rate: hourlyRate,
            total_pay: payslip.overtime_pay,
        },
        reimbursements,
        total_take_home: payslip.total_take_home,
        };

        res.status(200).json(breakdown);
    } catch (err) {
        console.error('Error fetching payslip:', err);
        res.status(500).json({ message: 'Internal server error' });
    } 
});

// GET /api/payslips/summary?payroll_period_id=1
router.get('/summary', authRequired, adminOnly, async (req, res) => {
    try {
        const { payroll_period_id } = req.query;

        if (!payroll_period_id) {
        return res.status(400).json({ message: 'payroll_period_id is required' });
        }

        // Ambil semua payslip dalam periode tersebut
        const payslips = await db('payslips')
        .join('users', 'payslips.user_id', 'users.id')
        .where('payroll_period_id', payroll_period_id)
        .select(
            'users.id as user_id',
            'users.username',
            'users.full_name',
            'payslips.total_take_home'
        );

        if (payslips.length === 0) {
        return res.status(404).json({ message: 'No payslips found for this period' });
        }

        // Hitung total seluruh take-home
        const totalAllTakeHome = payslips.reduce((sum, p) => sum + parseFloat(p.total_take_home), 0);

        res.status(200).json({
            payroll_period_id: parseInt(payroll_period_id),
            total_employees: payslips.length,
            total_take_home_all_employees: totalAllTakeHome,
            data: payslips
        });
    } catch (err) {
        console.error('Error fetching summary:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
