import React, { useEffect, useState } from 'react';
import '../styles/AuditLog.css';

function AuditLog() {
  // Dummy data for audit logs
  const dummyAuditLogs = [
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

  const [auditLogs] = useState(dummyAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'timestamp',
    direction: 'desc'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      // Commented out API call for now since it's not connected
      // const data = await api.getAuditLogs();
      // setAuditLogs(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'timestamp') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredAndSortedLogs = getSortedData(
    auditLogs.filter(log => 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.app.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="audit-log-container">
      <div className="audit-log-header">
        <h3>Audit Logs</h3>
        <div className="audit-log-controls">
          <input
            type="text"
            placeholder="Search by user, app, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      <div className="audit-log-table-container">
        {loading ? (
          <div className="loading">Loading audit logs...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('user')} className="sortable">
                  User {getSortIcon('user')}
                </th>
                <th onClick={() => handleSort('app')} className="sortable">
                  Application {getSortIcon('app')}
                </th>
                <th onClick={() => handleSort('action')} className="sortable">
                  Action {getSortIcon('action')}
                </th>
                <th onClick={() => handleSort('details')} className="sortable">
                  Details {getSortIcon('details')}
                </th>
                <th onClick={() => handleSort('timestamp')} className="sortable">
                  Timestamp (UTC) {getSortIcon('timestamp')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.user}</td>
                  <td>{log.app}</td>
                  <td>
                    <span className={`action-badge ${log.action.toLowerCase()}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.details}</td>
                  <td>{new Date(log.timestamp).toLocaleString('en-US', { timeZone: 'UTC' })} UTC</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AuditLog; 