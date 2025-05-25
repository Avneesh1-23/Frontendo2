import React, { useState } from 'react';
import '../styles/AppManagementModal.css';

function AppManagementModal({ app, userType, onClose, onUpdate, isAdminOnly }) {
  const [activeTab, setActiveTab] = useState(isAdminOnly ? 'settings' : 'roles');
  const [newRole, setNewRole] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [settings, setSettings] = useState({
    name: app.app_name,
    url: app.app_url,
    description: app.description || ''
  });

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
    if (selectedUser && selectedRole) {
      onUpdate('user', { 
        action: 'assign', 
        user: selectedUser, 
        role: selectedRole 
      });
      setSelectedUser('');
      setSelectedRole('');
    }
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
                  {/* Add user options here */}
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
                <button onClick={handleAssignUser}>Assign User</button>
              </div>
              <div className="users-list">
                {/* Add users list here */}
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