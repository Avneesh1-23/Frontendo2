import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/ApplicationList.css';
import AppManagementModal from './AppManagementModal';

function ApplicationList({ userType }) {
  const [applications, setApplications] = useState([]);
  const [newApp, setNewApp] = useState({ name: '', url: '', roles: '' });
  const [newRole, setNewRole] = useState({ appId: '', roleName: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showAccessRequestModal, setShowAccessRequestModal] = useState(false);
  const [selectedRestrictedApp, setSelectedRestrictedApp] = useState(null);
  const [accessRequestReason, setAccessRequestReason] = useState('');

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

  const handleAccessApp = async (app) => {
    try {
      // Check if user is end user and trying to access restricted apps
      if (userType === 'end') {
        const restrictedApps = ['hr', 'devops', 'finance'];
        const isRestricted = restrictedApps.some(restricted => 
          app.app_name.toLowerCase().includes(restricted)
        );

        if (isRestricted) {
          setSelectedRestrictedApp(app);
          setShowAccessRequestModal(true);
          return;
        }
      }

      // Check if this is the Github App (by name or URL)
      if (app.app_name.toLowerCase().includes('github') || app.app_url.includes('github.com')) {
        try {
          await api.triggerGithubAutoLogin();
        } catch (err) {
          console.error("Auto-login failed", err);
        }
      }

      // Open the app URL
      const formattedUrl = app.app_url.startsWith('http') ? app.app_url : `https://${app.app_url}`;
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(`Failed to access application: ${err.message}`);
    }
  };

  const handleRequestAccess = async () => {
    if (!accessRequestReason.trim()) {
      setError('Please provide a reason for access request');
      return;
    }

    try {
      // Here you would typically make an API call to send the access request
      // For now, we'll just show a success message
      setSuccess('Access request sent successfully. You will be notified once approved.');
      setShowAccessRequestModal(false);
      setSelectedRestrictedApp(null);
      setAccessRequestReason('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to send access request. Please try again.');
    }
  };

  const handleManageApp = (app) => {
    setSelectedApp(app);
  };

  const handleCloseModal = () => {
    setSelectedApp(null);
  };

  const handleAppUpdate = async (type, data) => {
    try {
      if (type === 'settings' && data.save) {
        // Update application settings
        const updatedApp = {
          app_name: data.name || selectedApp.app_name,
          app_url: data.url || selectedApp.app_url,
          description: data.description || selectedApp.description
        };

        await api.updateApplication(selectedApp.app_id, updatedApp);
        
        // Update the applications list with the new data
        const updatedApps = applications.map(app =>
          app.app_id === selectedApp.app_id
            ? { ...app, ...updatedApp }
            : app
        );
        setApplications(updatedApps);
        setSuccess('Application settings updated successfully');
        handleCloseModal();
      } else if (type === 'role') {
        if (data.action === 'add') {
          const updatedApps = applications.map(app =>
            app.app_id === selectedApp.app_id
              ? { ...app, roles: [...(app.roles || []), data.role] }
              : app
          );
          setApplications(updatedApps);
          setSuccess('Role added successfully');
        } else if (data.action === 'remove') {
          const updatedApps = applications.map(app =>
            app.app_id === selectedApp.app_id
              ? { ...app, roles: app.roles.filter(role => role !== data.role) }
              : app
          );
          setApplications(updatedApps);
          setSuccess('Role removed successfully');
        }
      } else if (type === 'user') {
        setSuccess('User assigned successfully');
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating application:', err);
      setError(`Failed to update application: ${err.message}`);
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      try {
        await api.deleteApplication(appId);
        setApplications(applications.filter(app => app.app_id !== appId));
        setSuccess('Application deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting application:', err);
        setError(`Failed to delete application: ${err.message}`);
      }
    }
  };

  if (loading) return <div className="loading">Loading applications...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="application-list-container">
      <h3>Applications</h3>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      
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
            <button onClick={handleAddApplication}>Add Application</button>
          </div>
        </div>
      )}

      {userType === 'app_admin' && (
        <div className="app-admin-controls">
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

      {userType === 'app_admin' && (
        <div className="app-admin-user-management-note">
          <p>
            As an App Admin, you can assign users to your applications and manage their roles.
          </p>
        </div>
      )}

      <ul className="applications-list">
        {applications.map((app) => (
          <li key={app.app_id} className="application-item">
            <div className="app-info">
              <span className="app-name">{app.app_name}</span>
              {userType === 'app_admin' && (
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
                onClick={() => handleAccessApp(app)}
              >
                Access
              </button>
              {(userType === 'admin' || userType === 'app_admin') && (
                <button 
                  className="manage-button" 
                  onClick={() => handleManageApp(app)}
                >
                  Manage
                </button>
              )}
              {userType === 'admin' && (
                <button 
                  className="delete-button" 
                  onClick={() => handleDeleteApplication(app.app_id)}
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {selectedApp && (
        <AppManagementModal
          app={selectedApp}
          userType={userType}
          onClose={handleCloseModal}
          onUpdate={handleAppUpdate}
          isAdminOnly={userType === 'admin'}
        />
      )}

      {showAccessRequestModal && selectedRestrictedApp && (
        <div className="modal-overlay">
          <div className="modal-content access-request-modal">
            <div className="modal-header">
              <h3>Request Access</h3>
              <button className="close-button" onClick={() => setShowAccessRequestModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="access-denied-message">
                Access to {selectedRestrictedApp.app_name} is restricted for end users.
              </p>
              <div className="request-form">
                <label htmlFor="access-reason">Reason for Access Request:</label>
                <textarea
                  id="access-reason"
                  value={accessRequestReason}
                  onChange={(e) => setAccessRequestReason(e.target.value)}
                  placeholder="Please explain why you need access to this application..."
                  rows="4"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="request-button" onClick={handleRequestAccess}>
                Submit Request
              </button>
              <button className="cancel-button" onClick={() => setShowAccessRequestModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationList; 