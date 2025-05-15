import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/ApplicationList.css';

function ApplicationList({ userType }) {
  const [applications, setApplications] = useState([]);
  const [newApp, setNewApp] = useState({ name: '', url: '', roles: '' });
  const [newRole, setNewRole] = useState({ appId: '', roleName: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      console.log('Fetching applications...');
      const data = await api.getApplications();
      console.log('Received applications:', data);
      setApplications(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(`Failed to fetch applications: ${err.message}`);
      setLoading(false);
    }
  };

  const handleAddApplication = async () => {
    if (newApp.name && newApp.url) {
      try {
        const application = {
          app_name: newApp.name,
          app_url: newApp.url,
          description: newApp.roles,
          created_by: 2 // This should come from the logged-in user
        };
        
        const result = await api.createApplication(application);
        setApplications([...applications, result]);
        setNewApp({ name: '', url: '', roles: '' });
        setSuccess('Application added successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error adding application:', err);
        setError(`Failed to add application: ${err.message}`);
      }
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleAddRole = async (appId, roleName) => {
    if (!appId || !roleName) {
      setError('Please select an application and enter a role name');
      return;
    }

    try {
      // This would be an API call to add a role
      const updatedApplications = applications.map(app => 
        app.app_id === parseInt(appId)
          ? { ...app, roles: [...(app.roles || []), roleName] }
          : app
      );
      setApplications(updatedApplications);
      setNewRole({ appId: '', roleName: '' });
      setSuccess('Role added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding role:', err);
      setError(`Failed to add role: ${err.message}`);
    }
  };

  const handleRemoveRole = async (appId, roleToRemove) => {
    try {
      // This would be an API call to remove a role
      const updatedApplications = applications.map(app =>
        app.app_id === appId
          ? { ...app, roles: (app.roles || []).filter(role => role !== roleToRemove) }
          : app
      );
      setApplications(updatedApplications);
      setSuccess('Role removed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error removing role:', err);
      setError(`Failed to remove role: ${err.message}`);
    }
  };

  const handleAccessApp = (url) => {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) return <div className="loading">Loading applications...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="application-list-container">
      <h3>Applications</h3>
      
      {success && <div className="success-message">{success}</div>}
      
      {userType === 'admin' && (
        <div className="admin-controls">
          <div className="add-application-form">
            <h4>Add New Application</h4>
            <input
              type="text"
              value={newApp.name}
              onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
              placeholder="Application Name"
            />
            <input
              type="text"
              value={newApp.url}
              onChange={(e) => setNewApp({ ...newApp, url: e.target.value })}
              placeholder="Application URL (e.g., app.example.com)"
            />
            <input
              type="text"
              value={newApp.roles}
              onChange={(e) => setNewApp({ ...newApp, roles: e.target.value })}
              placeholder="Roles (comma-separated)"
            />
            <button onClick={handleAddApplication}>Add Application</button>
          </div>

          <div className="add-role-form">
            <h4>Add New Role</h4>
            <select
              value={newRole.appId}
              onChange={(e) => setNewRole({ ...newRole, appId: e.target.value })}
            >
              <option value="">Select Application</option>
              {applications.map(app => (
                <option key={app.app_id} value={app.app_id}>{app.app_name}</option>
              ))}
            </select>
            <input
              type="text"
              value={newRole.roleName}
              onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })}
              placeholder="Role Name"
            />
            <button onClick={() => handleAddRole(newRole.appId, newRole.roleName)}>Add Role</button>
          </div>
        </div>
      )}

      <ul className="applications-list">
        {applications.map((app) => (
          <li key={app.app_id} className="application-item">
            <div className="app-info">
              <span className="app-name">{app.app_name}</span>
              {userType === 'admin' && (
                <div className="app-roles">
                  <strong>Roles:</strong>
                  {(app.roles || []).map((role, index) => (
                    <span key={index} className="role-tag">
                      {role}
                      <button 
                        className="remove-role"
                        onClick={() => handleRemoveRole(app.app_id, role)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="app-actions">
              <button 
                className="access-button"
                onClick={() => handleAccessApp(app.app_url)}
              >
                Access
              </button>
              {userType === 'admin' && (
                <button className="manage-button" onClick={() => alert(`Manage ${app.app_name}`)}>Manage</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ApplicationList; 