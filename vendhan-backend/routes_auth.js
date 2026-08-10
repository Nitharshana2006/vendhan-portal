// ============================================================
// AUTH ROUTES — /api/auth/register and /api/auth/login
// ============================================================
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
require('dotenv').config();

// ─── REGISTER ───────────────────────────────────────────────
// POST /api/auth/register
// body: { full_name, email, password, role }
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, role, setupSecret } = req.body;

    if (setupSecret !== process.env.SETUP_SECRET) {
      return res.status(403).json({ error: 'Not authorized to register.' });
    }
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash the password — never store plain text
    const hashedPassword = await bcrypt.hash(password, 10);

    const finalRole = role === 'admin' ? 'admin' : 'employee';

    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [full_name, email, hashedPassword, finalRole]
    );

    // Auto-login after registering: issue a token immediately
    const token = jwt.sign(
      { id: result.insertId, email, role: finalRole, full_name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registered successfully!',
      token,
      user: { id: result.insertId, full_name, email, role: finalRole }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// ─── LOGIN ──────────────────────────────────────────────────
// POST /api/auth/login
// body: { email, password }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Look up this person's real employees.id by matching email,
    // instead of using users.id (which is a separate, unrelated sequence).
    let employeeId = null;
    const [empRows] = await pool.query('SELECT id FROM employees WHERE email = ?', [email]);
    if (empRows.length > 0) {
      employeeId = empRows[0].id;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, employeeId }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

module.exports = router;
