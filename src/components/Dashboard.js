import React from 'react';
import '../styles/Dashboard.css';
import ApplicationList from './ApplicationList';
import AuditLog from './AuditLog';
import UserManagement from './UserManagement';

function Dashboard({ userType }) {
  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      {userType === 'super' && <AuditLog />}
      {userType === 'admin' && (
        <>
          <ApplicationList userType={userType} />
          <UserManagement />
        </>
      )}
      {userType === 'end' && <ApplicationList userType={userType} />}
    </div>
  );
}

export default Dashboard; 