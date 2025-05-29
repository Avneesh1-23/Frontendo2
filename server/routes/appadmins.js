const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Assuming this is a MySQL pool

// GET /api/appadmins
router.get('/', (req, res) => {
  const query = 'SELECT * FROM users WHERE user_type = "app_admin"';

  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    res.status(200).json(results);
  });
});

// POST /api/appadmins
router.post('/', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, "app_admin")';
  const values = [name, email, password];

  pool.query(query, values, (err, results) => {
    if (err) {
      console.error('Error inserting app admin:', err);
      return res.status(500).json({ error: 'Failed to add app admin' });
    }

    res.status(201).json({ message: 'App admin added successfully', adminId: results.insertId });
  });
});

module.exports = router;