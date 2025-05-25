import React from 'react';
import '../styles/AuditLog.css';

function AuditLog() {
  // Mock data for audit logs with 10 entries
  const auditLogs = [
    { user: 'John Doe', app: 'Dover Portal', action: 'Accessed', timestamp: '2024-03-15 10:00:00', details: 'Viewed dashboard' },
    { user: 'Jane Smith', app: 'GitHub', action: 'Modified', timestamp: '2024-03-15 11:30:00', details: 'Updated repository settings' },
    { user: 'Bob Johnson', app: 'HR Portal', action: 'Accessed', timestamp: '2024-03-15 09:15:00', details: 'Viewed employee records' },
    { user: 'Alice Brown', app: 'DevOps Portal', action: 'Modified', timestamp: '2024-03-15 14:20:00', details: 'Updated deployment config' },
    { user: 'Charlie Wilson', app: 'Finance Portal', action: 'Accessed', timestamp: '2024-03-15 15:45:00', details: 'Viewed quarterly reports' },
    { user: 'Emma Davis', app: 'Dover Portal', action: 'Modified', timestamp: '2024-03-15 16:30:00', details: 'Updated user permissions' },
    { user: 'Frank Miller', app: 'GitHub', action: 'Accessed', timestamp: '2024-03-15 13:10:00', details: 'Cloned repository' },
    { user: 'Grace Lee', app: 'HR Portal', action: 'Modified', timestamp: '2024-03-15 12:00:00', details: 'Updated employee profile' },
    { user: 'Henry Taylor', app: 'DevOps Portal', action: 'Accessed', timestamp: '2024-03-15 17:15:00', details: 'Viewed system logs' },
    { user: 'Ivy Martinez', app: 'Finance Portal', action: 'Modified', timestamp: '2024-03-15 18:00:00', details: 'Updated budget allocation' }
  ];

  return (
    <div className="audit-log-container">
      <h3>Audit Logs</h3>
      <div className="audit-log-table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Application</th>
              <th>Action</th>
              <th>Details</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log, index) => (
              <tr key={index}>
                <td>{log.user}</td>
                <td>{log.app}</td>
                <td>
                  <span className={`action-badge ${log.action.toLowerCase()}`}>
                    {log.action}
                  </span>
                </td>
                <td>{log.details}</td>
                <td>{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditLog; 