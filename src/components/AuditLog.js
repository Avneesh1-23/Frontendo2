import React from 'react';
import '../styles/AuditLog.css';

function AuditLog() {
  // Mock data for audit logs
  const auditLogs = [
    { user: 'John Doe', app: 'App1', action: 'Accessed', timestamp: '2023-10-01 10:00:00' },
    { user: 'Jane Smith', app: 'App2', action: 'Modified', timestamp: '2023-10-01 11:30:00' },
    { user: 'Bob Johnson', app: 'App1', action: 'Accessed', timestamp: '2023-10-02 09:15:00' },
  ];

  return (
    <div className="audit-log-container">
      <h3>Audit Logs</h3>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Application</th>
            <th>Action</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {auditLogs.map((log, index) => (
            <tr key={index}>
              <td>{log.user}</td>
              <td>{log.app}</td>
              <td>{log.action}</td>
              <td>{log.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AuditLog; 