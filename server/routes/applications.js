const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { exec } = require('child_process');

// Get all applications
router.get('/', async (req, res) => {
  try {
    // Get all applications
    const [applications] = await pool.query('SELECT * FROM applications');
    
    // For each application, get its roles
    const applicationsWithRoles = await Promise.all(applications.map(async (app) => {
      const [roles] = await pool.query(`
        SELECT r.role_id, r.role_name 
        FROM roles r
        JOIN app_entitlements ae ON r.role_id = ae.role_id
        WHERE ae.app_id = ?
      `, [app.app_id]);
      
      return {
        ...app,
        roles: roles
      };
    }));

    res.json(applicationsWithRoles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new application
router.post('/', async (req, res) => {
  const { app_name, app_url, description, created_by } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO applications (app_name, app_url, description, created_by) VALUES (?, ?, ?, ?)',
      [app_name, app_url, description, created_by]
    );
    res.status(201).json({ id: result.insertId, app_name, app_url, description });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get application by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM applications WHERE app_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application
router.put('/:id', async (req, res) => {
  const { app_name, app_url, description } = req.body;
  try {
    await pool.query(
      'UPDATE applications SET app_name = ?, app_url = ?, description = ? WHERE app_id = ?',
      [app_name, app_url, description, req.params.id]
    );
    res.json({ message: 'Application updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete application
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM applications WHERE app_id = ?', [req.params.id]);
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 