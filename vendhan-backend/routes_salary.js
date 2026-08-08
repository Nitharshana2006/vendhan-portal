const express = require('express');
const router = express.Router();
const db = require('./db');
const { verifyToken } = require('./auth');

// GET all salary records
router.get('/', verifyToken, (req, res) => {
  const sql = `
    SELECT s.*, e.full_name, e.employee_code, e.department
    FROM salary s
    JOIN employees e ON s.employee_id = e.id
    ORDER BY s.year DESC, s.month DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST create a new salary record
router.post('/', verifyToken, (req, res) => {
  const { employee_id, month, year, basic_salary, allowances, deductions, status, paid_date } = req.body;
  const net_salary = (parseFloat(basic_salary) || 0) + (parseFloat(allowances) || 0) - (parseFloat(deductions) || 0);

  const sql = `
    INSERT INTO salary (employee_id, month, year, basic_salary, allowances, deductions, net_salary, status, paid_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [employee_id, month, year, basic_salary, allowances || 0, deductions || 0, net_salary, status || 'Pending', paid_date || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Salary record created', id: result.insertId });
  });
});

// PUT update a salary record (e.g. mark as Paid)
router.put('/:id', verifyToken, (req, res) => {
  const { status, paid_date } = req.body;
  const sql = `UPDATE salary SET status = ?, paid_date = ? WHERE id = ?`;
  db.query(sql, [status, paid_date || null, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Salary record updated' });
  });
});

module.exports = router;
