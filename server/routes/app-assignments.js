const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Middleware to check if user is authorized to access the application
const checkAppAccess = async (req, res, next) => {
  const userId = req.user?.user_id;
  const appId = req.params.app_id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Check if user is super admin or admin
    const [users] = await pool.query(
      'SELECT user_type FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Super admins and admins have access to all applications
    if (users[0].user_type === 'super' || users[0].user_type === 'admin') {
      return next();
    }

    // For end users, check specific application access rules
    if (users[0].user_type === 'end') {
      const [app] = await pool.query(
        'SELECT app_name FROM applications WHERE app_id = ?',
        [appId]
      );

      if (app.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
      }

      // Allow access to Dover and GitHub portals
      if (app[0].app_name.toLowerCase().includes('dover') || 
          app[0].app_name.toLowerCase().includes('github')) {
        return next();
      }

      // Deny access to HR, DevOps, and Finance apps with specific error message
      if (app[0].app_name.toLowerCase().includes('hr') ||
          app[0].app_name.toLowerCase().includes('devops') ||
          app[0].app_name.toLowerCase().includes('finance')) {
        return res.status(403).json({ 
          message: 'Access denied: This application is restricted for end users. Please contact your administrator for access.' 
        });
      }
    }

    // For app admins, check if they have access to the specific application
    if (users[0].user_type === 'app_admin') {
      const [assignments] = await pool.query(
        'SELECT assignment_id FROM app_admin_assignments WHERE user_id = ? AND app_id = ?',
        [userId, appId]
      );

      if (assignments.length === 0) {
        return res.status(403).json({ message: 'Access denied to this application' });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all application assignments (filtered by user's access level)
router.get('/', async (req, res) => {
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Check user type
    const [users] = await pool.query(
      'SELECT user_type FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    let query = `
      SELECT 
        a.assignment_id,
        u.username as assigned_user,
        app.app_name,
        admin.username as assigned_by,
        a.assigned_at
      FROM app_admin_assignments a
      JOIN users u ON a.user_id = u.user_id
      JOIN applications app ON a.app_id = app.app_id
      JOIN users admin ON a.assigned_by = admin.user_id
    `;

    // If user is app_admin, only show their assigned applications
    if (users[0].user_type === 'app_admin') {
      query += ' WHERE a.user_id = ?';
      const [assignments] = await pool.query(query, [userId]);
      return res.json(assignments);
    }

    // For super admin and admin, show all assignments
    const [assignments] = await pool.query(query);
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign a user to an application
router.post('/', async (req, res) => {
  const { user_id, app_id, assigned_by } = req.body;
  
  try {
    // Check if user exists and is of type 'app_admin'
    const [users] = await pool.query(
      'SELECT user_type FROM users WHERE user_id = ?',
      [user_id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (users[0].user_type !== 'app_admin') {
      return res.status(400).json({ message: 'User must be of type app_admin' });
    }
    
    // Check if application exists
    const [apps] = await pool.query(
      'SELECT app_id FROM applications WHERE app_id = ?',
      [app_id]
    );
    
    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if assignment already exists
    const [existing] = await pool.query(
      'SELECT assignment_id FROM app_admin_assignments WHERE user_id = ? AND app_id = ?',
      [user_id, app_id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User is already assigned to this application' });
    }
    
    // Create the assignment
    const [result] = await pool.query(
      'INSERT INTO app_admin_assignments (user_id, app_id, assigned_by) VALUES (?, ?, ?)',
      [user_id, app_id, assigned_by]
    );
    
    res.status(201).json({
      assignment_id: result.insertId,
      user_id,
      app_id,
      assigned_by
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove a user from an application
router.delete('/:assignment_id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM app_admin_assignments WHERE assignment_id = ?',
      [req.params.assignment_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json({ message: 'Assignment removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assignments for a specific user
router.get('/user/:user_id', async (req, res) => {
  const requestingUserId = req.user?.user_id;
  const targetUserId = req.params.user_id;

  if (!requestingUserId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Check requesting user's type
    const [users] = await pool.query(
      'SELECT user_type FROM users WHERE user_id = ?',
      [requestingUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    let query = `
      SELECT 
        a.assignment_id,
        app.app_name,
        admin.username as assigned_by,
        a.assigned_at
      FROM app_admin_assignments a
      JOIN applications app ON a.app_id = app.app_id
      JOIN users admin ON a.assigned_by = admin.user_id
      WHERE a.user_id = ?
    `;

    // If requesting user is app_admin, only show their own assignments
    if (users[0].user_type === 'app_admin' && requestingUserId !== targetUserId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [assignments] = await pool.query(query, [targetUserId]);
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assignments for a specific application
router.get('/application/:app_id', checkAppAccess, async (req, res) => {
  try {
    const [assignments] = await pool.query(`
      SELECT 
        a.assignment_id,
        u.username as assigned_user,
        admin.username as assigned_by,
        a.assigned_at
      FROM app_admin_assignments a
      JOIN users u ON a.user_id = u.user_id
      JOIN users admin ON a.assigned_by = admin.user_id
      WHERE a.app_id = ?
    `, [req.params.app_id]);
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 