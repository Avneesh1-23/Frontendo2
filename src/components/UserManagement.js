import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/UserManagement.css';

function UserManagement({ isAppAdmin, onLogout }) {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, appsData] = await Promise.all([
        api.getUsers(),
        isAppAdmin ? api.getAppAdminApplications() : api.getApplications()
      ]);
      setUsers(usersData);
      setApplications(appsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (newUser.trim()) {
      try {
        const user = await api.createUser({
          username: newUser,
          user_type: 'end'
        });
        setUsers([...users, user]);
        setNewUser('');
        setSuccess('User added successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('Failed to add user');
      }
    }
  };

  const handleAssignApp = async (userId, appId, role) => {
    try {
      await api.assignUserToApplication(userId, appId, role);
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              assignedApps: [...user.assignedApps, { appId, role }] 
            } 
          : user
      );
      setUsers(updatedUsers);
      setSuccess('User assigned successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to assign user');
    }
  };

  const handleRemoveAssignment = async (userId, appId) => {
    try {
      await api.removeUserFromApplication(userId, appId);
      const updatedUsers = users.map(user =>
        user.id === userId
          ? {
              ...user,
              assignedApps: user.assignedApps.filter(app => app.appId !== appId)
            }
          : user
      );
      setUsers(updatedUsers);
      setSuccess('Assignment removed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to remove assignment');
    }
  };

  const handleAddRole = async (appId, roleName) => {
    try {
      await api.createRole({
        app_id: appId,
        role_name: roleName
      });
      const updatedApps = applications.map(app =>
        app.id === appId
          ? { ...app, roles: [...app.roles, roleName] }
          : app
      );
      setApplications(updatedApps);
      setSuccess('Role added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to add role');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h3>User Management</h3>
        <button className="back-button" onClick={onLogout}>Back to Main Page</button>
      </div>
      {success && <div className="success-message">{success}</div>}
      
      <div className="add-user-form">
        <input
          type="text"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          placeholder="Enter new user name"
        />
        <button onClick={handleAddUser}>Add User</button>
      </div>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <div className="user-assignments">
                <strong>Assigned Applications:</strong>
                {user.assignedApps?.length > 0 ? (
                  user.assignedApps.map((assignment, index) => (
                    <div key={index} className="assignment-tag">
                      {assignment.appName} ({assignment.role})
                      <button 
                        className="remove-assignment"
                        onClick={() => handleRemoveAssignment(user.id, assignment.appId)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="no-assignments">No applications assigned</span>
                )}
              </div>
            </div>
            <div className="assignment-controls">
              <select
                onChange={(e) => {
                  const [appId, role] = e.target.value.split('|');
                  handleAssignApp(user.id, appId, role);
                  e.target.value = '';
                }}
                defaultValue=""
              >
                <option value="" disabled>Assign to Application</option>
                {applications.map(app => (
                  app.roles.map(role => (
                    <option 
                      key={`${app.id}-${role}`} 
                      value={`${app.id}|${role}`}
                    >
                      {app.app_name} - {role}
                    </option>
                  ))
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>

      {isAppAdmin && (
        <div className="role-management">
          <h4>Manage Roles</h4>
          {applications.map(app => (
            <div key={app.id} className="app-roles">
              <h5>{app.app_name}</h5>
              <div className="add-role-form">
                <input
                  type="text"
                  placeholder="New role name"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddRole(app.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              <div className="role-list">
                {app.roles.map((role, index) => (
                  <span key={index} className="role-tag">{role}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserManagement; 