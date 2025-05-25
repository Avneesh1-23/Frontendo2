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
      setLoading(true);
      setError(null);
      
      // Fetch users data
      const usersData = await api.getUsers();
      
      // Fetch applications data based on user type
      let appsData = [];
      if (isAppAdmin) {
        try {
          appsData = await api.getAppAdminApplications();
        } catch (appError) {
          console.error('Error fetching app admin applications:', appError);
          // Don't set error here, just log it and continue with empty apps
        }
      } else {
        appsData = await api.getApplications();
      }

      // Process and combine the data
      const processedUsers = usersData.map(user => ({
        ...user,
        assignedApps: user.assignedApps || []
      }));

      setUsers(processedUsers);
      setApplications(appsData);
      setLoading(false);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError('Failed to fetch data. Please try again later.');
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
        <button className="back-button" onClick={onLogout}>Sign Out</button>
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
                  <div className="assignments-list">
                    {user.assignedApps.map((assignment, index) => (
                      <div key={index} className="assignment-tag">
                        <span className="app-name">{assignment.appName || 'Unknown App'}</span>
                        <span className="role-name">({assignment.role || 'No Role'})</span>
                        <button 
                          className="remove-assignment"
                          onClick={() => handleRemoveAssignment(user.id, assignment.appId)}
                          title="Remove Assignment"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
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