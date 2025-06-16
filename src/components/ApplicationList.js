import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/ApplicationList.css';
import AppManagementModal from './AppManagementModal';
 
// GitHub logo SVG component
const GitHubLogo = () => (
  <svg height="24" viewBox="0 0 16 16" width="24" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
  </svg>
);
 
function ApplicationList({ userType }) {
  const [applications, setApplications] = useState(() => {
    // Try to load applications from localStorage first
    const savedApplications = localStorage.getItem('applications');
    return savedApplications ? JSON.parse(savedApplications) : [];
  });
  const [newApp, setNewApp] = useState({ name: '', url: '', roles: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [restrictedApps, setRestrictedApps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredApplications, setFilteredApplications] = useState([]);
 
  useEffect(() => {
    fetchApplications();
  }, []);
 
  // Save applications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('applications', JSON.stringify(applications));
  }, [applications]);
 
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    let filtered = applications;
   
    // For end users, filter out restricted applications from the main view
    if (userType === 'end') {
      filtered = applications.filter(app => !restrictedApps.includes(app.app_id));
    }
   
    // Apply search filter
    filtered = filtered.filter(app =>
      app.app_name.toLowerCase().includes(lowerCaseQuery)
    );
   
    setFilteredApplications(filtered);
  }, [applications, searchQuery, restrictedApps, userType]);
 
  const fetchApplications = async () => {
    try {
      console.log('Fetching applications...');
      const data = await api.getApplications();
      console.log('Received applications:', data);
     
      // Merge fetched data with existing data from localStorage
      const mergedData = data.map(fetchedApp => {
        const existingApp = applications.find(app => app.app_id === fetchedApp.app_id);
        return {
          ...fetchedApp,
          roles: existingApp?.roles || fetchedApp.roles || []
        };
      });
     
      setApplications(mergedData);
 
      // Set restricted apps for end users
      if (userType === 'end') {
        const restricted = mergedData.filter(app => {
          const appName = app.app_name.toLowerCase();
          return appName.includes('hr') ||
                 appName.includes('devops') ||
                 appName.includes('finance');
        });
        setRestrictedApps(restricted.map(app => app.app_id));
      }
 
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
        // Parse roles from comma-separated string
        const roles = newApp.roles
          ? newApp.roles.split(',').map(role => role.trim()).filter(role => role)
          : [];
 
        const application = {
          app_name: newApp.name,
          app_url: newApp.url,
          description: newApp.roles,
          roles: roles,
          created_by: 2 // This should come from the logged-in user
        };
       
        const result = await api.createApplication(application);
        const newApplication = {
          ...result,
          roles: roles
        };
       
        setApplications(prevApps => [...prevApps, newApplication]);
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
 
  const handleRemoveRole = async (appId, roleToRemove) => {
    try {
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
    if (userType === 'end' && restrictedApps.includes(app.app_id)) {
      setError(
        <div className="access-denied-message">
          <span>Access denied. Please request access to this application.</span>
          <button
            className="back-to-apps-button"
            onClick={() => setError(null)}
          >
            Back to Applications
          </button>
        </div>
      );
      return;
    }
 
    try {
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
          description: data.description || selectedApp.description,
          roles: selectedApp.roles // Preserve existing roles
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
 
  const getAppIcon = (appName) => {
    const name = appName.toLowerCase();
    if (name.includes('github')) return <GitHubLogo />;
    if (name.includes('jira')) return '🎯';
    if (name.includes('slack')) return '💬';
    if (name.includes('confluence')) return '📚';
    if (name.includes('jenkins')) return '⚙️';
    if (name.includes('aws')) return '☁️';
    if (name.includes('azure')) return '🌩️';
    if (name.includes('gcp')) return '☁️';
    if (name.includes('docker')) return '🐳';
    if (name.includes('kubernetes')) return '⚓';
    if (name.includes('gitlab')) return '🦊';
    if (name.includes('bitbucket')) return '🐙';
    if (name.includes('trello')) return '📋';
    if (name.includes('figma')) return '🎨';
    if (name.includes('zoom')) return '🎥';
    if (name.includes('teams')) return '👥';
    if (name.includes('hr')) return '👥';
    if (name.includes('finance')) return '💰';
    if (name.includes('devops')) return '🛠️';
    return '🔗'; // Default icon
  };
 
  if (loading) return <div className="loading">Loading applications...</div>;
  if (error) return <div className="error">{error}</div>;
 
  return (
    <div className="application-list-container">
      {/* Header section with title */}
      <div className="application-header-controls">
        <h3>Applications</h3>
      </div>
 
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
 
      {(userType === 'admin' || userType === 'super') && (
        <div className="admin-controls">
          <div className="add-application-form">
            <h4>Add New Application</h4>
            <input
              type="text"
              value={newApp.name}
              onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
              placeholder="Application Name"
              className="app-input"
            />
            <input
              type="text"
              value={newApp.url}
              onChange={(e) => setNewApp({ ...newApp, url: e.target.value })}
              placeholder="Application URL"
              className="app-input"
            />
            <input
              type="text"
              value={newApp.roles}
              onChange={(e) => setNewApp({ ...newApp, roles: e.target.value })}
              placeholder="Roles (comma-separated)"
              className="app-input"
            />
            <button onClick={handleAddApplication} className="add-button">
              Add Application
            </button>
          </div>
        </div>
      )}
 
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search applications..."
          className="search-input"
        />
      </div>
 
      {filteredApplications.length === 0 ? (
        <div className="no-applications">
          {userType === 'end' ? (
            <p>No applications available. Please request access to restricted applications through the access request form.</p>
          ) : (
            <p>No applications found. {searchQuery && 'Try a different search term.'}</p>
          )}
        </div>
      ) : (
        <div className="applications-table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Application Name</th>
                <th>Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.app_id}>
                  <td>
                    <span className="app-icon table-icon">{getAppIcon(app.app_name)}</span>
                  </td>
                  <td>
                    <span className="app-name">{app.app_name}</span>
                  </td>
                  <td>
                    <div className="app-roles">
                      {app.roles && app.roles.length > 0 ? (
                        app.roles.map((role, index) => (
                          <span key={index} className="role-tag">{role}</span>
                        ))
                      ) : (
                        <span className="no-roles">No roles assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="app-actions">
                    <div className="action-buttons">
                      <button
                        className="access-button"
                        onClick={() => handleAccessApp(app)}
                      >
                        Access
                      </button>
                      {userType !== 'end' && (
                        <>
                          <button
                            className="manage-button"
                            onClick={() => handleManageApp(app)}
                          >
                            Manage
                          </button>
                          {(userType === 'super' || userType === 'admin') && (
                            <button
                              className="delete-button"
                              onClick={() => handleDeleteApplication(app.app_id)}
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
 
      {selectedApp && (
        <AppManagementModal
          app={selectedApp}
          userType={userType}
          onClose={handleCloseModal}
          onUpdate={handleAppUpdate}
          isAdminOnly={userType === 'admin' || userType === 'super'}
        />
      )}
    </div>
  );
}
 
export default ApplicationList;