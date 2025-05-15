const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Get all users
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT user_id, username, role, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [result] = await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );
    
    res.status(201).json({
      user_id: result.insertId,
      username,
      role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, username, role, created_at FROM users WHERE user_id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { username, role } = req.body;
    
    await pool.query(
      'UPDATE users SET username = ?, role = ? WHERE user_id = ?',
      [username, role, req.params.id]
    );
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 