const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all secrets
router.get('/', async (req, res) => {
  try {
    const [secrets] = await pool.query('SELECT * FROM secrets');
    res.json(secrets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new secret
router.post('/', async (req, res) => {
  try {
    const { secret_name, secret_value, application_id, created_by } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO secrets (secret_name, secret_value, application_id, created_by) VALUES (?, ?, ?, ?)',
      [secret_name, secret_value, application_id, created_by]
    );
    
    res.status(201).json({
      secret_id: result.insertId,
      secret_name,
      application_id,
      created_by
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get secret by ID
router.get('/:id', async (req, res) => {
  try {
    const [secrets] = await pool.query('SELECT * FROM secrets WHERE secret_id = ?', [req.params.id]);
    
    if (secrets.length === 0) {
      return res.status(404).json({ message: 'Secret not found' });
    }
    
    res.json(secrets[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update secret
router.put('/:id', async (req, res) => {
  try {
    const { secret_name, secret_value } = req.body;
    
    await pool.query(
      'UPDATE secrets SET secret_name = ?, secret_value = ? WHERE secret_id = ?',
      [secret_name, secret_value, req.params.id]
    );
    
    res.json({ message: 'Secret updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete secret
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM secrets WHERE secret_id = ?', [req.params.id]);
    res.json({ message: 'Secret deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 