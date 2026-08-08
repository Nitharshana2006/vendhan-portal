const express = require('express');
const router = express.Router();
const pool = require('./db');
const { verifyToken, requireAdmin } = require('./auth');

// GET all leave requests
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.*, e.full_name, e.employee_code, e.department
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      ORDER BY l.applied_on DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch leave requests.' });
  }
});

// POST apply for leave
router.post('/', verifyToken, async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, days, reason } = req.body;
    if (!employee_id || !leave_type || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const [result] = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employee_id, leave_type, start_date, end_date, days, reason || null]
    );
    res.json({ message: 'Leave request submitted', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not submit leave request.' });
  }
});

// PUT approve/reject a leave request (admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query(
      `UPDATE leave_requests SET status = ?, reviewed_by = ?, reviewed_on = NOW() WHERE id = ?`,
      [status, req.user.id, req.params.id]
    );
    res.json({ message: 'Leave request updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update leave request.' });
  }
});

module.exports = router;
