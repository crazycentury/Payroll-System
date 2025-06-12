const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const { authRequired, adminOnly } = require('../middleware/authMiddleware');

const WORK_HOURS_PER_DAY = 8;

// Helper untuk menghitung jumlah hari kerja (Senin–Jumat)
function countWorkdays(startDateStr, endDateStr) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  let workdays = 0;

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const day = date.getDay(); // 0: Minggu, 6: Sabtu
    if (day >= 1 && day <= 5) {
      workdays++;
    }
  }

  return workdays;
}

router.post('/run', authRequired, adminOnly, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Cari periode aktif yang belum diproses
    const period = await db('payroll_periods')
      .where('start_date', '<=', today)
      .andWhere('end_date', '>=', today)
      .andWhere('is_processed', false)
      .first();

    if (!period) {
      return res.status(400).json({ message: 'No active unprocessed payroll period found' });
    }

    // 2. Cek jika payslip sudah ada
    const existingPayslips = await db('payslips')
      .where('payroll_period_id', period.id)
      .first();

    if (existingPayslips) {
      return res.status(400).json({ message: 'Payroll already run for this period' });
    }

    // 3. Hitung jumlah hari kerja (Senin–Jumat) pada periode
    const totalWorkDays = countWorkdays(period.start_date, period.end_date);
    if (totalWorkDays === 0) {
      return res.status(400).json({ message: 'Payroll period has no working days (Mon-Fri)' });
    }

    // 4. Ambil user yang punya attendance dalam periode
    const users = await db('attendances')
      .distinct('user_id')
      .whereBetween('date', [period.start_date, period.end_date]);

    for (const user of users) {
      const userId = user.user_id;

      // 5. Ambil salary user
      const userData = await db('users').where({ id: userId }).first();
      const baseSalary = userData.salary ? parseFloat(userData.salary) : 0;

      // 6. Attendance count
      const totalAttendanceDays = await db('attendances')
        .where({ user_id: userId })
        .andWhereBetween('date', [period.start_date, period.end_date])
        .count();
      const attendanceDays = parseInt(totalAttendanceDays[0].count || 0);

      // 7. Overtime sum
      const totalOvertimeHours = await db('overtimes')
        .where({ user_id: userId })
        .andWhereBetween('date', [period.start_date, period.end_date])
        .sum('hours');
      const overtimeHours = parseFloat(totalOvertimeHours[0].sum || 0);

      // 8. Reimbursement sum
      const reimbursementTotal = await db('reimbursements')
        .where({ user_id: userId })
        .andWhereBetween('date', [period.start_date, period.end_date])
        .sum('amount');
      const reimbursementAmount = parseFloat(reimbursementTotal[0].sum || 0);

      // 9. Perhitungan
      const proratedSalary = (attendanceDays / totalWorkDays) * baseSalary;
      const hourlyRate = baseSalary / (totalWorkDays * WORK_HOURS_PER_DAY);
      const overtimePay = overtimeHours * hourlyRate * 2;

      const totalTakeHome = proratedSalary + overtimePay + reimbursementAmount;

      // 10. Simpan payslip
      await db('payslips').insert({
        user_id: userId,
        payroll_period_id: period.id,
        total_attendance_days: attendanceDays,
        prorated_salary: proratedSalary,
        total_overtime_hours: overtimeHours,
        overtime_pay: overtimePay,
        reimbursement_total: reimbursementAmount,
        total_take_home: totalTakeHome,
        created_by: req.user.userId,
        created_at: new Date()
      });
    }

    // 11. Tandai periode sudah diproses
    await db('payroll_periods')
      .where({ id: period.id })
      .update({ is_processed: true, updated_at: new Date() });

    res.status(200).json({ message: 'Payroll successfully processed', period_id: period.id });
  } catch (err) {
    console.error('Error running payroll:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
