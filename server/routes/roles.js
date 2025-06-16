const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Get all roles
router.get('/', async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM roles');
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
});

// Create a new role with password
router.post('/', async (req, res) => {
  const { role_name, password, app_id } = req.body;
  const userId = req.user?.user_id;

  if (!role_name || !password) {
    return res.status(400).json({ message: 'Role name and password are required' });
  }

  try {
    // Start a transaction
    await pool.query('START TRANSACTION');

    // Create the role
    const [roleResult] = await pool.query(
      'INSERT INTO roles (role_name) VALUES (?)',
      [role_name]
    );
    const roleId = roleResult.insertId;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store the role password
    await pool.query(
      'INSERT INTO role_passwords (role_id, password_hash, created_by) VALUES (?, ?, ?)',
      [roleId, hashedPassword, userId]
    );

    // If app_id is provided, create the app entitlement
    if (app_id) {
      await pool.query(
        'INSERT INTO app_entitlements (app_id, role_id, permission_level, assigned_by) VALUES (?, ?, ?, ?)',
        [app_id, roleId, 'read', userId]
      );
    }

    await pool.query('COMMIT');

    res.status(201).json({
      message: 'Role created successfully',
      role_id: roleId,
      role_name
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Failed to create role' });
  }
});

// Update a role
router.put('/:id', async (req, res) => {
  const { role_name, password } = req.body;
  const roleId = req.params.id;
  const userId = req.user?.user_id;

  if (!role_name) {
    return res.status(400).json({ message: 'Role name is required' });
  }

  try {
    await pool.query('START TRANSACTION');

    // Update role name
    await pool.query(
      'UPDATE roles SET role_name = ? WHERE role_id = ?',
      [role_name, roleId]
    );

    // If password is provided, update it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await pool.query(
        'UPDATE role_passwords SET password_hash = ? WHERE role_id = ?',
        [hashedPassword, roleId]
      );
    }

    await pool.query('COMMIT');

    res.json({
      message: 'Role updated successfully',
      role_id: roleId,
      role_name
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Failed to update role' });
  }
});

// Delete a role
router.delete('/:id', async (req, res) => {
  const roleId = req.params.id;

  try {
    await pool.query('START TRANSACTION');

    // Delete role password first (due to foreign key constraint)
    await pool.query('DELETE FROM role_passwords WHERE role_id = ?', [roleId]);

    // Delete the role
    await pool.query('DELETE FROM roles WHERE role_id = ?', [roleId]);

    await pool.query('COMMIT');

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Failed to delete role' });
  }
});

// Get role password
router.get('/:id/password', async (req, res) => {
  const roleId = req.params.id;
  const userId = req.user?.user_id;

  try {
    const [passwords] = await pool.query(
      'SELECT password_hash FROM role_passwords WHERE role_id = ?',
      [roleId]
    );

    if (passwords.length === 0) {
      return res.status(404).json({ message: 'Role password not found' });
    }

    res.json({ password_hash: passwords[0].password_hash });
  } catch (error) {
    console.error('Error fetching role password:', error);
    res.status(500).json({ message: 'Failed to fetch role password' });
  }
});

// Update role password
router.put('/:id/password', async (req, res) => {
  const roleId = req.params.id;
  const { password } = req.body;
  const userId = req.user?.user_id;

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      'UPDATE role_passwords SET password_hash = ? WHERE role_id = ?',
      [hashedPassword, roleId]
    );

    res.json({ message: 'Role password updated successfully' });
  } catch (error) {
    console.error('Error updating role password:', error);
    res.status(500).json({ message: 'Failed to update role password' });
  }
});

module.exports = router; 