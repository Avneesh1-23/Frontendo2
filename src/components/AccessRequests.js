import React, { useEffect, useState } from 'react';
import '../styles/AccessRequests.css';

function AccessRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Mock data for access requests
  useEffect(() => {
    const mockRequests = [
      {
        id: 1,
        user: 'John Doe',
        app: 'HR Portal',
        reason: 'Need access to view employee records for project management',
        status: 'pending',
        requestedAt: '2024-03-15 10:00:00'
      },
      {
        id: 2,
        user: 'Jane Smith',
        app: 'Finance Portal',
        reason: 'Required for quarterly budget review',
        status: 'pending',
        requestedAt: '2024-03-15 11:30:00'
      },
      {
        id: 3,
        user: 'Bob Johnson',
        app: 'DevOps Portal',
        reason: 'Need to monitor deployment status',
        status: 'pending',
        requestedAt: '2024-03-15 09:15:00'
      }
    ];
    setRequests(mockRequests);
    setLoading(false);
  }, []);

  const handleApprove = async (requestId) => {
    try {
      // Here you would typically make an API call to approve the request
      setRequests(requests.map(request => 
        request.id === requestId 
          ? { ...request, status: 'approved' }
          : request
      ));
      setSuccess('Access request approved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to approve request. Please try again.');
    }
  };

  const handleDeny = async (requestId) => {
    try {
      // Here you would typically make an API call to deny the request
      setRequests(requests.map(request => 
        request.id === requestId 
          ? { ...request, status: 'denied' }
          : request
      ));
      setSuccess('Access request denied');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to deny request. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading access requests...</div>;

  return (
    <div className="access-requests-container">
      <h3>Access Requests</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="requests-table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Application</th>
              <th>Reason</th>
              <th>Requested At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className={`request-row ${request.status}`}>
                <td>{request.user}</td>
                <td>{request.app}</td>
                <td>{request.reason}</td>
                <td>{request.requestedAt}</td>
                <td>
                  <span className={`status-badge ${request.status}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </td>
                <td>
                  {request.status === 'pending' && (
                    <div className="request-actions">
                      <button 
                        className="approve-button"
                        onClick={() => handleApprove(request.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="deny-button"
                        onClick={() => handleDeny(request.id)}
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AccessRequests; 