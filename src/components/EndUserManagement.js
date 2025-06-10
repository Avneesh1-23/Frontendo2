import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/EndUserManagement.css';

function EndUserManagement() {
  const [applications, setApplications] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    selectedApp: '',
    selectedRole: '',
    selectedOperation: ''
  });
  // Initialize with dummy data
  const [endUsers, setEndUsers] = useState([
    {
      user_id: 1,
      username: 'enduser1',
      email: 'enduser1@example.com',
      assignments: [
        { app_id: 1, app_name: 'HR Portal', role_id: 1, role_name: 'Viewer' }
      ],
      created_at: '2024-03-15T10:00:00'
    },
    {
      user_id: 2,
      username: 'enduser2',
      email: 'enduser2@example.com',
      assignments: [
        { app_id: 2, app_name: 'Finance App', role_id: 2, role_name: 'Editor' },
        { app_id: 3, app_name: 'DevOps Dashboard', role_id: 3, role_name: 'Manager' }
      ],
      created_at: '2024-03-16T14:30:00'
    }
  ]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await api.getApplications();
      setApplications(data);
    } catch (err) {
      setError('Failed to fetch applications');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password || !newUser.selectedApp || !newUser.selectedOperation) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate password strength
    if (newUser.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      // Create new end user object
      const selectedApp = applications.find(app => app.app_id === parseInt(newUser.selectedApp));

      const newEndUser = {
        user_id: Date.now(), // Use timestamp as unique ID
        username: newUser.username,
        email: newUser.email,
        password: newUser.password, // In a real app, this should be hashed
        assignments: [
          {
            app_id: selectedApp.app_id,
            app_name: selectedApp.app_name,
            role_id: null,
            role_name: newUser.selectedRole,
            operation: newUser.selectedOperation
          }
        ],
        created_at: new Date().toISOString()
      };

      // Add to end users list
      setEndUsers(prevUsers => [...prevUsers, newEndUser]);

      // Store in localStorage to persist data
      const updatedUsers = [...endUsers, newEndUser];
      localStorage.setItem('endUsers', JSON.stringify(updatedUsers));

      setSuccess('End user added successfully');
      setNewUser({ 
        username: '', 
        email: '', 
        password: '', 
        selectedApp: '', 
        selectedRole: '', 
        selectedOperation: '' 
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding end user:', err);
      setError('Failed to add end user');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteUser = (userId) => {
    try {
      const updatedUsers = endUsers.filter(user => user.user_id !== userId);
      setEndUsers(updatedUsers);
      
      // Update localStorage
      localStorage.setItem('endUsers', JSON.stringify(updatedUsers));
      
      setSuccess('End user deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting end user:', err);
      setError('Failed to delete end user');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Load users from localStorage on component mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('endUsers');
    if (savedUsers) {
      setEndUsers(JSON.parse(savedUsers));
    }
  }, []);

  return (
    <div className="end-user-management">
      <h2>End User Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="add-user-section">
        <h3>Add New End User</h3>
        <form onSubmit={handleAddUser}>
          <div className="form-group">
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Username"
              className="input-field"
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Email"
              className="input-field"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Password (min. 8 characters)"
              className="input-field"
              minLength="8"
            />
          </div>
          <div className="form-group">
            <select
              value={newUser.selectedApp}
              onChange={(e) => {
                setNewUser({ ...newUser, selectedApp: e.target.value, selectedRole: '' });
              }}
              className="select-field"
            >
              <option value="">Select Application</option>
              {applications.map(app => (
                <option key={app.app_id} value={app.app_id}>
                  {app.app_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select
              value={newUser.selectedRole}
              onChange={(e) => setNewUser({ ...newUser, selectedRole: e.target.value })}
              className="select-field"
              disabled={!newUser.selectedApp}
            >
              <option value="">Select Role</option>
              {newUser.selectedApp && applications.find(app => app.app_id === parseInt(newUser.selectedApp))?.roles?.map((role, index) => (
                <option key={index} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select
              value={newUser.selectedOperation}
              onChange={(e) => setNewUser({ ...newUser, selectedOperation: e.target.value })}
              className="select-field"
            >
              <option value="">Select Operation</option>
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <button type="submit" className="add-button">Add End User</button>
        </form>
      </div>

      <div className="end-users-list-container">
        <h3>End Users List</h3>
        <div className="end-users-table-container">
          <table className="end-users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Application Access</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {endUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <div className="user-assignments">
                      {user.assignments.map((assignment, index) => (
                        <div key={index} className="assignment-tag">
                          <span className="app-name">{assignment.app_name}</span>
                          {assignment.role_name && (
                            <span className="role-badge">{assignment.role_name}</span>
                          )}
                          {assignment.operation && (
                            <span className="operation-badge">{assignment.operation}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>{new Date(user.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteUser(user.user_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EndUserManagement; 