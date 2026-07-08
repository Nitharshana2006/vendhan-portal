// ============================================================
// DATA ENTRY ROUTES — /api/data-entries
//
// ACCESS RULE (enforced here in the backend, at the database
// query level — not just hidden in the frontend):
//   - role = employee → only returns rows they personally submitted
//   - role = admin    → returns rows from everyone
// ============================================================
const express = require('express');
const router = express.Router();
const pool = require('./db');
const { verifyToken } = require('./auth');

// ─── GET RECORDS (role-aware) ───────────────────────────────
// GET /api/data-entries
router.get('/', verifyToken, async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'admin') {
      // Admin sees every record from every user
      [rows] = await pool.query('SELECT * FROM data_entries ORDER BY created_at DESC');
    } else {
      // Employee sees ONLY their own submitted records
      [rows] = await pool.query(
        'SELECT * FROM data_entries WHERE submitted_by = ? ORDER BY created_at DESC',
        [req.user.id]
      );
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch data entries.' });
  }
});

// ─── SAVE NEW RECORD ────────────────────────────────────────
// POST /api/data-entries
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      publication, edition, author, category, headline, subheadline,
      location, keywords, content, word_count, sentiment, match_score
    } = req.body;

    if (!headline) {
      return res.status(400).json({ error: 'Headline is required to save a record.' });
    }

    const [result] = await pool.query(
      `INSERT INTO data_entries
        (publication, edition, author, category, headline, subheadline, location,
         keywords, content, word_count, sentiment, match_score,
         submitted_by, submitted_by_name, submitted_by_role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        publication || null, edition || null, author || null, category || null,
        headline, subheadline || null, location || null, keywords || null,
        content || null, word_count || null, sentiment || null, match_score || null,
        req.user.id, req.user.full_name, req.user.role
      ]
    );

    const [newRow] = await pool.query('SELECT * FROM data_entries WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Record saved successfully!', record: newRow[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save record.' });
  }
});

// ─── DELETE RECORD ──────────────────────────────────────────
// DELETE /api/data-entries/:id
// Employees can only delete their OWN records. Admin can delete any record.
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM data_entries WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Record not found.' });

    if (req.user.role !== 'admin' && existing[0].submitted_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own records.' });
    }

    await pool.query('DELETE FROM data_entries WHERE id = ?', [id]);
    res.json({ message: 'Record deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete record.' });
  }
});

module.exports = router;