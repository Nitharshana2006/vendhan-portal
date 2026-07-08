// ============================================================
// DATABASE CONNECTION
// Creates a reusable connection pool to MySQL (via XAMPP)
// ============================================================
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Quick test on startup so errors show immediately instead of on first request
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL database: ' + process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error('❌ Could not connect to MySQL. Check XAMPP is running and .env settings are correct.');
    console.error(err.message);
  }
})();

module.exports = pool;