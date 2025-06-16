import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/AppAdminManagement.css';

function AppAdminManagement({ onLogout }) {
  const [applications, setApplications] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    selectedApps: []
  });
  const [appSearchTerm, setAppSearchTerm] = useState('');
  const [showAppDropdown, setShowAppDropdown] = useState(false);
  // Initialize with data from localStorage or default data
  const [appAdmins, setAppAdmins] = useState(() => {
    const savedAdmins = localStorage.getItem('appAdmins');
    if (savedAdmins) {
      return JSON.parse(savedAdmins);
    }
    // Default data if nothing in localStorage
    return [
      {
        user_id: 1,
        username: 'appadmin1',
        email: 'appadmin1@example.com',
        applications: [
          { app_id: 1, app_name: 'HR Portal' },
          { app_id: 2, app_name: 'Finance App' }
        ],
        created_at: '2024-03-15T10:00:00'
      },
      {
        user_id: 2,
        username: 'appadmin2',
        email: 'appadmin2@example.com',
        applications: [
          { app_id: 3, app_name: 'DevOps Dashboard' }
        ],
        created_at: '2024-03-16T14:30:00'
      }
    ];
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Save appAdmins to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('appAdmins', JSON.stringify(appAdmins));
  }, [appAdmins]);

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

  const handleAddAppAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.username || !newAdmin.email || newAdmin.selectedApps.length === 0) {
      setError('Please fill in all fields and select at least one application');
      return;
    }

    try {
      // Create new app admin object
      const newAppAdmin = {
        user_id: Date.now(), // Use timestamp as unique ID
        username: newAdmin.username,
        email: newAdmin.email,
        applications: newAdmin.selectedApps.map(appId => {
          const app = applications.find(a => a.app_id === appId);
          return {
            app_id: app.app_id,
            app_name: app.app_name
          };
        }),
        created_at: new Date().toISOString()
      };

      // Add to app admins list
      setAppAdmins(prevAdmins => [...prevAdmins, newAppAdmin]);

      setSuccess('App admin added successfully with access to selected applications');
      setNewAdmin({ username: '', email: '', selectedApps: [] });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to add app admin');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteAppAdmin = (userId) => {
    try {
      setAppAdmins(prevAdmins => prevAdmins.filter(admin => admin.user_id !== userId));
      setSuccess('App admin deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting app admin:', err);
      setError('Failed to delete app admin');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Filter applications based on search term
  const filteredApplications = applications.filter(app =>
    app.app_name.toLowerCase().includes(appSearchTerm.toLowerCase())
  );

  const handleAppSelection = (appId) => {
    setNewAdmin(prev => ({
      ...prev,
      selectedApps: prev.selectedApps.includes(appId)
        ? prev.selectedApps.filter(id => id !== appId)
        : [...prev.selectedApps, appId]
    }));
  };

  const filteredAppAdmins = appAdmins.filter(admin =>
    admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.applications.some(app => app.app_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="app-admin-management">
      <h2>App Admin Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="add-admin-section">
        <h3>Add New App Admin</h3>
        <form onSubmit={handleAddAppAdmin}>
          <div className="form-group">
            <input
              type="text"
              value={newAdmin.username}
              onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
              placeholder="Username"
              className="input-field"
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              placeholder="Email"
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label className="applications-label">Select Applications:</label>
            <div className="custom-multi-select">
              <div 
                className={`select-header ${showAppDropdown ? 'active' : ''}`}
                onClick={() => setShowAppDropdown(!showAppDropdown)}
              >
                <div className="selected-apps-text">
                  {newAdmin.selectedApps.length > 0 
                    ? filteredApplications
                        .filter(app => newAdmin.selectedApps.includes(app.app_id))
                        .map(app => app.app_name)
                        .join(', ')
                    : 'Select applications'}
                </div>
                <span className="dropdown-arrow">▼</span>
              </div>
              {showAppDropdown && (
                <div className="select-dropdown">
                  <div className="search-container">
                    <input
                      type="text"
                      value={appSearchTerm}
                      onChange={(e) => setAppSearchTerm(e.target.value)}
                      placeholder="Search applications..."
                      className="search-input"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="options-container">
                    {filteredApplications.length > 0 ? (
                      filteredApplications.map((app) => (
                        <div
                          key={app.app_id}
                          className="option-item"
                          onClick={() => {
                            const newSelectedApps = newAdmin.selectedApps.includes(app.app_id)
                              ? newAdmin.selectedApps.filter(id => id !== app.app_id)
                              : [...newAdmin.selectedApps, app.app_id];
                            setNewAdmin(prev => ({
                              ...prev,
                              selectedApps: newSelectedApps
                            }));
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={newAdmin.selectedApps.includes(app.app_id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              const newSelectedApps = e.target.checked
                                ? [...newAdmin.selectedApps, app.app_id]
                                : newAdmin.selectedApps.filter(id => id !== app.app_id);
                              setNewAdmin(prev => ({
                                ...prev,
                                selectedApps: newSelectedApps
                              }));
                            }}
                          />
                          <span>{app.app_name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="no-options">No applications found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button type="submit" className="add-button">Add App Admin</button>
        </form>
      </div>

      <div className="app-admins-list-container">
        <h3>App Admins List</h3>
        <input
          type="text"
          placeholder="Search app admins by username, email, or application..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field search-input"
        />
        <div className="app-admins-table-container">
          <table className="app-admins-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Assigned Applications</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppAdmins.map((admin) => (
                <tr key={admin.user_id}>
                  <td>{admin.username}</td>
                  <td>{admin.email}</td>
                  <td>
                    <div className="app-admin-apps">
                      {admin.applications.map((app, index) => (
                        <span key={index} className="app-admin-app-tag">
                          {app.app_name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{new Date(admin.created_at).toLocaleString('en-US', { timeZone: 'UTC' })}</td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteAppAdmin(admin.user_id)}
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

export default AppAdminManagement;