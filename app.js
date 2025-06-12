require('dotenv').config();
const express = require('express');
const app = express();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/users');
const payrollPeriodRoutes = require('./routes/payrollPeriodRoutes');
const attendacesRoutes = require('./routes/attendanceRoutes');
const overtimeRoutes = require('./routes/overtimeRoutes');
const reimbursementRoutes = require('./routes/reimbursementRoutes');
const runPayrollRoutes = require('./routes/payrollRoutes');
const runPaySlipsRoutes = require('./routes/payslipsRoutes');
const { authRequired } = require('./middleware/authMiddleware');

// Middleware
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payroll-periods', payrollPeriodRoutes);
app.use('/api/attendace', attendacesRoutes);
app.use('/api/overtimes', overtimeRoutes);
app.use('/api/reimbursement', reimbursementRoutes);
app.use('/api/payroll', runPayrollRoutes);
app.use('/api/payslips', runPaySlipsRoutes);

app.get('/api/me', authRequired, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = app;
