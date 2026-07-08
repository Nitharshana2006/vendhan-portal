// ============================================================
// AUTH MIDDLEWARE
// Verifies the JWT token sent by the frontend and attaches
// the logged-in user's info (id, role, name) to req.user
// ============================================================
const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // expects "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
    }
    req.user = decoded; // { id, email, role, full_name }
    next();
  });
}

// Only allows admins through — use on admin-only routes
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access only.' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };