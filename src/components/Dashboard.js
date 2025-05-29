import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/Dashboard.css';
import AccessRequests from './AccessRequests';
import AppAdminManagement from './AppAdminManagement';
import ApplicationList from './ApplicationList';
import AuditLog from './AuditLog';
import EndUserManagement from './EndUserManagement';
import UserAccessGraph from './UserAccessGraph';

function Dashboard({ userType, onLogout, theme, onThemeToggle }) {
  const [restrictedApps, setRestrictedApps] = useState([]);
  const [selectedRestrictedApp, setSelectedRestrictedApp] = useState(null);
  const [accessRequestReason, setAccessRequestReason] = useState('');
  const [showAccessRequestModal, setShowAccessRequestModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (userType === 'end') {
      fetchRestrictedApps();
    }
    fetchAccessRequests();
    fetchApplications();
  }, [userType]);

  const fetchRestrictedApps = async () => {
    try {
      const data = await api.getApplications();
      const restricted = data.filter(app => {
        const appName = app.app_name.toLowerCase();
        return appName.includes('hr') || 
               appName.includes('devops') || 
               appName.includes('finance');
      });
      setRestrictedApps(restricted);
    } catch (err) {
      console.error('Error fetching restricted applications:', err);
      setError('Failed to fetch restricted applications');
    }
  };

  const fetchAccessRequests = async () => {
    try {
      const data = await api.getAccessRequests();
      setAccessRequests(data);
    } catch (err) {
      setError('');
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await api.getApplications();
      setApplications(data);
    } catch (err) {
      setError('Failed to fetch applications');
    }
  };

  const handleRequestAccess = async () => {
    if (!selectedRestrictedApp || !accessRequestReason.trim()) {
      setError('Please select an application and provide a reason for access request');
      return;
    }

    try {
      const requestData = {
        app_id: selectedRestrictedApp.app_id,
        app_name: selectedRestrictedApp.app_name,
        reason: accessRequestReason
      };
      
      // Add to sent requests immediately
      setSentRequests(prev => [...prev, {
        ...requestData,
        status: 'pending',
        requested_at: new Date().toISOString()
      }]);
      
      setSuccess('Access request sent successfully. You will be notified once approved.');
      setShowAccessRequestModal(false);
      setSelectedRestrictedApp(null);
      setAccessRequestReason('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send access request. Please try again.');
    }
  };

  const handleAccessRequest = async (requestId, action) => {
    try {
      await api.updateAccessRequest(requestId, action);
      setSuccess(`Access request ${action} successfully`);
      fetchAccessRequests();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to ${action} access request`);
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="dashboard-controls">
          <button 
            className="theme-toggle-button" 
            onClick={onThemeToggle}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="back-button" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      {userType === 'end' && (
        <>
          <div className="access-request-section">
            <div className="access-request-header">
              <h3>Request Access</h3>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
            </div>
            <div className="access-request-form">
              <select
                value={selectedRestrictedApp?.app_id || ''}
                onChange={(e) => {
                  const app = restrictedApps.find(a => a.app_id === parseInt(e.target.value));
                  setSelectedRestrictedApp(app);
                }}
                className="app-select"
              >
                <option value="">Select application...</option>
                {restrictedApps.map(app => (
                  <option key={app.app_id} value={app.app_id}>
                    {app.app_name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={accessRequestReason}
                onChange={(e) => setAccessRequestReason(e.target.value)}
                placeholder="Reason for access request..."
                className="access-reason-input"
              />
              <button className="request-button" onClick={handleRequestAccess}>
                Request
              </button>
            </div>
          </div>

          {sentRequests.length > 0 && (
            <div className="sent-requests-section">
              <h3>Sent Requests</h3>
              <div className="requests-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Application</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Requested At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sentRequests.map((request, index) => (
                      <tr key={index} className={`request-row ${request.status}`}>
                        <td>{request.app_name}</td>
                        <td>{request.reason}</td>
                        <td>
                          <span className={`status-badge ${request.status}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        <td>{new Date(request.requested_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {userType === 'super' && (
        <>
          <UserAccessGraph />
          <AuditLog />
        </>
      )}
      {userType === 'admin' && (
        <>
          <ApplicationList userType={userType} />
          <AppAdminManagement onLogout={onLogout} />
        </>
      )}
      {userType === 'app_admin' && (
        <>
          <AccessRequests 
            requests={accessRequests}
            onHandleRequest={handleAccessRequest}
          />
          <ApplicationList 
            applications={applications}
            userType={userType}
          />
          <EndUserManagement />
        </>
      )}
      {userType === 'end' && <ApplicationList userType={userType} />}
    </div>
  );
}

export default Dashboard; 