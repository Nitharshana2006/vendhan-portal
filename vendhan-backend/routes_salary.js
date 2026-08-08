const express = require('express');
const router = express.Router();
const pool = require('./db');
const { verifyToken } = require('./auth');

// GET all salary records
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, e.full_name, e.employee_code, e.department
      FROM salary s
      JOIN employees e ON s.employee_id = e.id
      ORDER BY s.year DESC, s.month DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch salary records.' });
  }
});

// POST create a new salary record
router.post('/', verifyToken, async (req, res) => {
  try {
    const { employee_id, month, year, basic_salary, allowances, deductions, status, paid_date } = req.body;
    const net_salary = (parseFloat(basic_salary) || 0) + (parseFloat(allowances) || 0) - (parseFloat(deductions) || 0);

    const [result] = await pool.query(
      `INSERT INTO salary (employee_id, month, year, basic_salary, allowances, deductions, net_salary, status, paid_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, month, year, basic_salary, allowances || 0, deductions || 0, net_salary, status || 'Pending', paid_date || null]
    );
    res.json({ message: 'Salary record created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create salary record.' });
  }
});

// PUT update a salary record (e.g. mark as Paid)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { status, paid_date } = req.body;
    await pool.query(
      `UPDATE salary SET status = ?, paid_date = ? WHERE id = ?`,
      [status, paid_date || null, req.params.id]
    );
    res.json({ message: 'Salary record updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update salary record.' });
  }
});

module.exports = router;
