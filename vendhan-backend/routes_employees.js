// ============================================================
// EMPLOYEE ROUTES — /api/employees
// Admin adds/edits/deletes employees. Everyone logged in can view.
// ============================================================
const express = require('express');
const router = express.Router();
const pool = require('./db');
const { verifyToken, requireAdmin } = require('./auth');

// ─── GET ALL EMPLOYEES ──────────────────────────────────────
// GET /api/employees   (any logged-in user can view the list)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch employees.' });
  }
});

// ─── ADD NEW EMPLOYEE ───────────────────────────────────────
// POST /api/employees   (admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { employee_code, full_name, department, designation, email, phone, joined_date, status, basic_salary } = req.body;

    if (!full_name) {
      return res.status(400).json({ error: 'Employee name is required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO employees
        (employee_code, full_name, department, designation, email, phone, joined_date, status, basic_salary, added_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_code || null,
        full_name,
        department || null,
        designation || null,
        email || null,
        phone || null,
        joined_date || null,
        status || 'Active',
        basic_salary || 0,
        req.user.id
      ]
    );

    const [newRow] = await pool.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Employee added successfully!', employee: newRow[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add employee.' });
  }
});

// ─── UPDATE EMPLOYEE ────────────────────────────────────────
// PUT /api/employees/:id   (admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, department, designation, email, phone, status, basic_salary } = req.body;

    await pool.query(
      `UPDATE employees SET
        full_name = COALESCE(?, full_name),
        department = COALESCE(?, department),
        designation = COALESCE(?, designation),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        status = COALESCE(?, status),
        basic_salary = COALESCE(?, basic_salary)
       WHERE id = ?`,
      [full_name, department, designation, email, phone, status, basic_salary, id]
    );

    const [updated] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);
    if (updated.length === 0) return res.status(404).json({ error: 'Employee not found.' });

    res.json({ message: 'Employee updated successfully!', employee: updated[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update employee.' });
  }
});

// ─── DELETE EMPLOYEE ────────────────────────────────────────
// DELETE /api/employees/:id   (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM employees WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Employee not found.' });
    res.json({ message: 'Employee deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete employee.' });
  }
});

module.exports = router;