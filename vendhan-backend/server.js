// ============================================================
// VENDHAN INFOTECH HRMS — BACKEND SERVER
// Run with: node server.js
// Server starts on http://localhost:5000
// ============================================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());              // allows your HTML pages to call this API
app.use(express.json());      // allows reading JSON request bodies
// ─── ROUTES ──────────────────────────────────────────────────
app.use('/api/auth', require('./routes_auth'));
app.use('/api/employees', require('./routes_employees'));
app.use('/api/data-entries', require('./routes_data_entries'));
app.use('/api/attendance', require('./routes_attendance'));
// ─── HEALTH CHECK ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Vendhan InfoTech HRMS API is running ✅' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
