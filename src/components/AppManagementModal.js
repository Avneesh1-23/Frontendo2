import React, { useEffect, useState } from 'react';
import '../styles/AppManagementModal.css';

function AppManagementModal({ app, userType, onClose, onUpdate, isAdminOnly }) {
  const [activeTab, setActiveTab] = useState(isAdminOnly ? 'settings' : 'roles');
  const [newRole, setNewRole] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('');
  const [settings, setSettings] = useState({
    name: app.app_name,
    url: app.app_url,
    description: app.description || ''
  });

  // Get end users from localStorage
  const [endUsers, setEndUsers] = useState([]);
  useEffect(() => {
    const savedUsers = localStorage.getItem('endUsers');
    if (savedUsers) {
      setEndUsers(JSON.parse(savedUsers));
    }
  }, []);

  // Get users assigned to this app
  const assignedUsers = endUsers.filter(user => 
    user.assignments.some(assignment => assignment.app_id === app.app_id)
  );

  // Get available users (not assigned to this app)
  const availableUsers = endUsers.filter(user => 
    !user.assignments.some(assignment => assignment.app_id === app.app_id)
  );

  const handleAddRole = () => {
    if (newRole.trim()) {
      onUpdate('role', { action: 'add', role: newRole });
      setNewRole('');
    }
  };

  const handleRemoveRole = (role) => {
    onUpdate('role', { action: 'remove', role });
  };

  const handleAssignUser = () => {
    if (selectedUser && selectedRole && selectedOperation) {
      // Find the user to assign
      const userToAssign = endUsers.find(user => user.user_id === parseInt(selectedUser));
      if (!userToAssign) return;

      // Create new assignment
      const newAssignment = {
        app_id: app.app_id,
        app_name: app.app_name,
        role_id: selectedRole,
        role_name: selectedRole,
        operation: selectedOperation
      };

      // Update user's assignments
      const updatedUser = {
        ...userToAssign,
        assignments: [...userToAssign.assignments, newAssignment]
      };

      // Update endUsers state
      const updatedUsers = endUsers.map(user => 
        user.user_id === updatedUser.user_id ? updatedUser : user
      );
      setEndUsers(updatedUsers);

      // Update localStorage
      localStorage.setItem('endUsers', JSON.stringify(updatedUsers));

      // Notify parent component
      onUpdate('user', { 
        action: 'assign', 
        user: selectedUser, 
        role: selectedRole,
        operation: selectedOperation
      });

      // Reset form
      setSelectedUser('');
      setSelectedRole('');
      setSelectedOperation('');
    }
  };

  const handleRemoveUser = (userId) => {
    // Find the user to remove
    const userToUpdate = endUsers.find(user => user.user_id === userId);
    if (!userToUpdate) return;

    // Remove the assignment for this app
    const updatedUser = {
      ...userToUpdate,
      assignments: userToUpdate.assignments.filter(
        assignment => assignment.app_id !== app.app_id
      )
    };

    // Update endUsers state
    const updatedUsers = endUsers.map(user => 
      user.user_id === updatedUser.user_id ? updatedUser : user
    );
    setEndUsers(updatedUsers);

    // Update localStorage
    localStorage.setItem('endUsers', JSON.stringify(updatedUsers));

    // Notify parent component
    onUpdate('user', {
      action: 'remove',
      userId
    });
  };

  const handleSettingsChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    onUpdate('settings', {
      ...settings,
      save: true
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Manage {app.app_name}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          {!isAdminOnly && (
            <>
              <button 
                className={`tab-button ${activeTab === 'roles' ? 'active' : ''}`}
                onClick={() => setActiveTab('roles')}
              >
                Roles
              </button>
              <button 
                className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                Users
              </button>
            </>
          )}
          {isAdminOnly && (
            <button 
              className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          )}
        </div>

        <div className="modal-body">
          {isAdminOnly && activeTab === 'settings' && (
            <div className="settings-section">
              <h4>Application Settings</h4>
              <div className="setting-item">
                <label>Application Name:</label>
                <input 
                  type="text" 
                  value={settings.name}
                  onChange={(e) => handleSettingsChange('name', e.target.value)}
                />
              </div>
              <div className="setting-item">
                <label>Application URL:</label>
                <input 
                  type="text" 
                  value={settings.url}
                  onChange={(e) => handleSettingsChange('url', e.target.value)}
                />
              </div>
              <div className="setting-item">
                <label>Description:</label>
                <textarea 
                  value={settings.description}
                  onChange={(e) => handleSettingsChange('description', e.target.value)}
                />
              </div>
            </div>
          )}

          {!isAdminOnly && activeTab === 'roles' && (
            <div className="roles-section">
              <h4>Manage Roles</h4>
              <div className="add-role-form">
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Enter new role name"
                />
                <button onClick={handleAddRole}>Add Role</button>
              </div>
              <div className="roles-list">
                {app.roles?.map((role, index) => (
                  <div key={index} className="role-item">
                    <span>{role}</span>
                    <button 
                      className="remove-role"
                      onClick={() => handleRemoveRole(role)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isAdminOnly && activeTab === 'users' && (
            <div className="users-section">
              <h4>Manage Users</h4>
              <div className="assign-user-form">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Select User</option>
                  {availableUsers.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">Select Role</option>
                  {app.roles?.map((role, index) => (
                    <option key={index} value={role}>{role}</option>
                  ))}
                </select>
                <select
                  value={selectedOperation}
                  onChange={(e) => setSelectedOperation(e.target.value)}
                >
                  <option value="">Select Operation</option>
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="manager">Manager</option>
                </select>
                <button onClick={handleAssignUser}>Assign User</button>
              </div>
              <div className="users-list">
                <h5>Assigned Users</h5>
                <table className="assigned-users-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Operation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedUsers.map(user => {
                      const assignment = user.assignments.find(a => a.app_id === app.app_id);
                      return (
                        <tr key={user.user_id}>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className="role-badge">{assignment?.role_name || 'Not Set'}</span>
                          </td>
                          <td>
                            <span className="operation-badge">{assignment?.operation || 'Not Set'}</span>
                          </td>
                          <td>
                            <button
                              className="remove-user-button"
                              onClick={() => handleRemoveUser(user.user_id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {isAdminOnly ? (
            <button className="save-button" onClick={handleSaveSettings}>
              Save Changes
            </button>
          ) : (
            <button className="save-button" onClick={onClose}>
              Done
            </button>
          )}
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppManagementModal; 