// ============================================================
// ATTENDANCE ROUTES — /api/attendance
// Admin marks/edits attendance. Everyone logged in can view.
// ============================================================
const express = require('express');
const router = express.Router();
const pool = require('./db');
const { verifyToken, requireAdmin } = require('./auth');

// ─── GET ATTENDANCE (optionally filter by date) ─────────────
// GET /api/attendance            -> all records, newest first
// GET /api/attendance?date=2026-08-08  -> just that date
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
// POST /api/attendance   (admin only)
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
