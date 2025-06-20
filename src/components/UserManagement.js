import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/UserManagement.css';

function UserManagement({ isAppAdmin, onLogout }) {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    selectedApp: '',
    selectedRole: ''
  });
  const [applications, setApplications] = useState(() => {
    // Try to load applications from localStorage first
    const savedApplications = localStorage.getItem('applications');
    return savedApplications ? JSON.parse(savedApplications) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, appsData] = await Promise.all([
          api.getUsers(),
          api.getApplications()
        ]);
        
        // Get stored roles from localStorage
        const storedRoles = JSON.parse(localStorage.getItem('appRoles') || '{}');
        
        // Merge stored roles with fetched applications
        const appsWithStoredRoles = appsData.map(app => ({
          ...app,
          roles: storedRoles[app.app_id] || app.roles || []
        }));
        
        setUsers(usersData);
        setApplications(appsWithStoredRoles);
        
        // Save to localStorage
        localStorage.setItem('applications', JSON.stringify(appsWithStoredRoles));
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Save applications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('applications', JSON.stringify(applications));
  }, [applications]);

  const handleAddUser = async () => {
    if (!newUser.username.trim() || !newUser.email.trim()) {
      setError('Please provide both username and email');
      return;
    }

    try {
      // Create the user
      const response = await api.createUser({
        username: newUser.username,
        email: newUser.email,
        password_hash: 'defaultPassword123',
        user_type: 'end'
      });

      // If app admin and application is selected, assign the user to the application
      if (isAppAdmin && newUser.selectedApp && newUser.selectedRole) {
        await api.assignUserToApplication(response.user_id, newUser.selectedApp, newUser.selectedRole);
      }

      // Add the new user to the users list
      const newUserObj = {
        user_id: response.user_id,
        username: newUser.username,
        email: newUser.email,
        user_type: 'end',
        assignedApps: []
      };

      if (isAppAdmin && newUser.selectedApp && newUser.selectedRole) {
        const selectedAppData = applications.find(app => app.app_id === newUser.selectedApp);
        newUserObj.assignedApps.push({
          appId: newUser.selectedApp,
          appName: selectedAppData?.app_name || 'Unknown App',
          role: newUser.selectedRole
        });
      }

      setUsers(prevUsers => [...prevUsers, newUserObj]);
      
      // Clear the form
      setNewUser({
        username: '',
        email: '',
        selectedApp: '',
        selectedRole: ''
      });
      
      setSuccess('User added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to add user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAssignApp = async (userId, appId, role) => {
    try {
      await api.assignUserToApplication(userId, appId, role);
      const updatedUsers = users.map(user => 
        user.user_id === userId 
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
        user.user_id === userId
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
      const roleData = {
        role_name: roleName,
        password: 'defaultPassword123',
        app_id: appId
      };
      
      await api.createRole(roleData);
      
      // Update roles in localStorage
      const storedRoles = JSON.parse(localStorage.getItem('appRoles') || '{}');
      const updatedRoles = {
        ...storedRoles,
        [appId]: [...(storedRoles[appId] || []), roleName]
      };
      localStorage.setItem('appRoles', JSON.stringify(updatedRoles));
      
      // Update applications state
      const updatedApplications = applications.map(app => 
        app.app_id === appId
          ? { ...app, roles: [...(app.roles || []), roleName] }
          : app
      );
      setApplications(updatedApplications);
      
      // Save to localStorage
      localStorage.setItem('applications', JSON.stringify(updatedApplications));
      
      setSuccess('Role added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to add role');
    }
  };

  const handleRemoveRole = async (appId, roleName) => {
    try {
      await api.deleteRole(appId, roleName);
      
      // Update roles in localStorage
      const storedRoles = JSON.parse(localStorage.getItem('appRoles') || '{}');
      const updatedRoles = {
        ...storedRoles,
        [appId]: (storedRoles[appId] || []).filter(role => role !== roleName)
      };
      localStorage.setItem('appRoles', JSON.stringify(updatedRoles));
      
      // Update applications state
      const updatedApplications = applications.map(app => 
        app.app_id === appId
          ? { ...app, roles: (app.roles || []).filter(role => role !== roleName) }
          : app
      );
      setApplications(updatedApplications);
      
      // Save to localStorage
      localStorage.setItem('applications', JSON.stringify(updatedApplications));
      
      setSuccess('Role removed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to remove role');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h3>User Management</h3>
      </div>
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="add-user-form">
        <input
          type="text"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          placeholder="Enter new user name"
        />
        <input
          type="email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          placeholder="Enter user email"
        />
        {isAppAdmin && (
          <>
            <select
              value={newUser.selectedApp}
              onChange={(e) => setNewUser({ ...newUser, selectedApp: e.target.value, selectedRole: '' })}
            >
              <option value="">Select Application</option>
              {applications.map(app => (
                <option key={app.app_id} value={app.app_id}>
                  {app.app_name}
                </option>
              ))}
            </select>
            {newUser.selectedApp && (
              <select
                value={newUser.selectedRole}
                onChange={(e) => setNewUser({ ...newUser, selectedRole: e.target.value })}
              >
                <option value="">Select Role</option>
                {applications
                  .find(app => app.app_id === newUser.selectedApp)?.roles
                  .map(role => (
                    <option key={typeof role === 'object' ? role.role_id : role} value={typeof role === 'object' ? role.role_name : role}>
                      {typeof role === 'object' ? role.role_name : role}
                    </option>
                  ))}
              </select>
            )}
          </>
        )}
        <button onClick={handleAddUser}>
          Add {isAppAdmin ? 'End User' : 'App Admin'}
        </button>
      </div>

      {isAppAdmin && (
        <>
          <div className="new-users-list">
            <h4>Recently Added End Users</h4>
            <ul>
              {users
                .filter(user => user.user_type === 'end')
                .map((user) => (
                <li key={user.user_id}>
                  <div className="user-info">
                    <span className="user-name">{user.username}</span>
                    <span className="user-email">{user.email}</span>
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
                                onClick={() => handleRemoveAssignment(user.user_id, assignment.appId)}
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
                    <div className="assignment-form">
                      <select
                        value={user.selectedApp || ''}
                        onChange={(e) => {
                          const updatedUsers = users.map(u => 
                            u.user_id === user.user_id 
                              ? { ...u, selectedApp: e.target.value, selectedRole: '' }
                              : u
                          );
                          setUsers(updatedUsers);
                        }}
                      >
                        <option value="">Select Application</option>
                        {applications
                          .filter(app => !user.assignedApps?.some(a => a.appId === app.app_id))
                          .map(app => (
                            <option key={app.app_id} value={app.app_id}>
                              {app.app_name}
                            </option>
                          ))}
                      </select>
                      {user.selectedApp && (
                        <select
                          value={user.selectedRole || ''}
                          onChange={(e) => {
                            const updatedUsers = users.map(u => 
                              u.user_id === user.user_id 
                                ? { ...u, selectedRole: e.target.value }
                                : u
                            );
                            setUsers(updatedUsers);
                          }}
                        >
                          <option value="">Select Role</option>
                          {applications
                            .find(app => app.app_id === user.selectedApp)?.roles
                            .map(role => (
                              <option key={typeof role === 'object' ? role.role_id : role} value={typeof role === 'object' ? role.role_name : role}>
                                {typeof role === 'object' ? role.role_name : role}
                              </option>
                            ))}
                        </select>
                      )}
                      {user.selectedApp && user.selectedRole && (
                        <button
                          onClick={() => handleAssignApp(user.user_id, user.selectedApp, user.selectedRole)}
                          className="assign-button"
                        >
                          Assign
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="role-management">
            <h4>Manage Roles</h4>
            {applications.map(app => (
              <div key={app.app_id} className="app-roles">
                <h5>{app.app_name}</h5>
                <div className="add-role-form">
                  <input
                    type="text"
                    placeholder="New role name"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddRole(app.app_id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                <div className="role-list">
                  {(app.roles || []).map((role, index) => (
                    <span key={index} className="role-tag">{role}</span>
                  ))}
                </div>
                <div className="remove-role-form">
                  <input
                    type="text"
                    placeholder="Role to remove"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleRemoveRole(app.app_id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default UserManagement; 