const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Create a new access request
router.post('/', async (req, res) => {
  const userId = req.user?.user_id;
  const { app_id, app_name, reason } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!app_id || !reason) {
    return res.status(400).json({ message: 'Application ID and reason are required' });
  }

  try {
    // Check if user already has a pending request for this app
    const [existingRequests] = await pool.query(
      'SELECT * FROM access_requests WHERE user_id = ? AND app_id = ? AND status = "pending"',
      [userId, app_id]
    );

    if (existingRequests.length > 0) {
      return res.status(400).json({ message: 'You already have a pending request for this application' });
    }

    // Create new access request
    const [result] = await pool.query(
      'INSERT INTO access_requests (user_id, app_id, reason, status, requested_at) VALUES (?, ?, ?, "pending", NOW())',
      [userId, app_id, reason]
    );

    res.status(201).json({
      message: 'Access request created successfully',
      request_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating access request:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all access requests (for admins and app admins)
router.get('/', async (req, res) => {
  const userId = req.user?.user_id;
  const userType = req.user?.user_type;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    let query = `
      SELECT 
        ar.request_id,
        ar.user_id,
        u.username,
        ar.app_id,
        a.app_name,
        ar.reason,
        ar.status,
        ar.requested_at,
        ar.responded_at,
        ar.responded_by
      FROM access_requests ar
      JOIN users u ON ar.user_id = u.user_id
      JOIN applications a ON ar.app_id = a.app_id
    `;

    // If user is app admin, only show requests for their applications
    if (userType === 'app_admin') {
      query += `
        JOIN app_admin_assignments aa ON a.app_id = aa.app_id
        WHERE aa.user_id = ?
      `;
    }

    query += ' ORDER BY ar.requested_at DESC';

    const [requests] = await pool.query(query, userType === 'app_admin' ? [userId] : []);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching access requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update access request status (approve/deny)
router.put('/:requestId', async (req, res) => {
  const userId = req.user?.user_id;
  const userType = req.user?.user_type;
  const { requestId } = req.params;
  const { status } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!['approved', 'denied'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    // Check if user has permission to update this request
    const [request] = await pool.query(
      'SELECT * FROM access_requests WHERE request_id = ?',
      [requestId]
    );

    if (request.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (userType === 'app_admin') {
      const [assignment] = await pool.query(
        'SELECT * FROM app_admin_assignments WHERE user_id = ? AND app_id = ?',
        [userId, request[0].app_id]
      );

      if (assignment.length === 0) {
        return res.status(403).json({ message: 'Not authorized to manage this request' });
      }
    }

    // Update request status
    await pool.query(
      'UPDATE access_requests SET status = ?, responded_at = NOW(), responded_by = ? WHERE request_id = ?',
      [status, userId, requestId]
    );

    // If approved, grant access to the application
    if (status === 'approved') {
      await pool.query(
        'INSERT INTO user_applications (user_id, app_id, assigned_at) VALUES (?, ?, NOW())',
        [request[0].user_id, request[0].app_id]
      );
    }

    res.json({ message: `Request ${status} successfully` });
  } catch (error) {
    console.error('Error updating access request:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 