import React from 'react';
import '../styles/Dashboard.css';
import AccessRequests from './AccessRequests';
import ApplicationList from './ApplicationList';
import AuditLog from './AuditLog';
import UserAccessGraph from './UserAccessGraph';
import UserManagement from './UserManagement';

function Dashboard({ userType, onLogout, theme, onThemeToggle }) {
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
          <button className="back-button" onClick={onLogout}>Back to Main Page</button>
        </div>
      </div>
      {userType === 'super' && (
        <>
          <UserAccessGraph />
          <AuditLog />
        </>
      )}
      {userType === 'admin' && (
        <>
          <ApplicationList userType={userType} />
          <UserManagement onLogout={onLogout} />
        </>
      )}
      {userType === 'app_admin' && (
        <>
          <AccessRequests />
          <UserManagement isAppAdmin={true} onLogout={onLogout} />
          <ApplicationList userType={userType} />
        </>
      )}
      {userType === 'end' && <ApplicationList userType={userType} />}
    </div>
  );
}

export default Dashboard; 