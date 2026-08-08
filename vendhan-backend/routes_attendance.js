// ============================================================
// ATTENDANCE ROUTES — /api/attendance
// Admin marks/edits attendance. Everyone logged in can view.
// ============================================================
const express = require('express');
const router = express.Router();
const pool = require('./db');
const { verifyToken, requireAdmin } = require('./auth');

// ─── GET ATTENDANCE (optionally filter by date) ─────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    let query = `
      SELECT a.*, e.full_name, e.department, e.employee_code
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
    `;
    const params = [];
    if (date) {
      query += ' WHERE a.date = ?';
      params.push(date);
    }
    query += ' ORDER BY a.date DESC, e.full_name ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch attendance.' });
  }
});

// ─── MARK / ADD ATTENDANCE ───────────────────────────────────
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { employee_id, date, check_in, check_out, status, note } = req.body;
    if (!employee_id || !date) {
      return res.status(400).json({ error: 'employee_id and date are required.' });
    }
    const [result] = await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in, check_out, status, note, marked_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id,
        date,
        check_in || null,
        check_out || null,
        status || 'Present',
        note || null,
        req.user.id
      ]
    );
    res.json({ message: 'Attendance marked', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not mark attendance.' });
  }
});

// ─── UPDATE ATTENDANCE ────────────────────────────────────────
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { check_in, check_out, status, note } = req.body;
    await pool.query(
      `UPDATE attendance SET check_in = ?, check_out = ?, status = ?, note = ? WHERE id = ?`,
      [check_in || null, check_out || null, status, note || null, req.params.id]
    );
    res.json({ message: 'Attendance updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update attendance.' });
  }
});

// ─── DELETE ATTENDANCE ────────────────────────────────────────
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete attendance.' });
  }
});

module.exports = router;
