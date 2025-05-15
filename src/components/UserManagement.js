import React, { useState } from 'react';
import '../styles/UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', assignedApps: [] },
    { id: 2, name: 'Jane Smith', assignedApps: [] },
  ]);

  const [newUser, setNewUser] = useState('');
  const [applications, setApplications] = useState([
    { id: 1, name: 'App1', roles: ['Admin', 'User'] },
    { id: 2, name: 'App2', roles: ['Viewer', 'Editor'] },
    { id: 3, name: 'App3', roles: ['Basic', 'Premium'] },
  ]);

  const handleAddUser = () => {
    if (newUser.trim()) {
      setUsers([...users, { id: users.length + 1, name: newUser, assignedApps: [] }]);
      setNewUser('');
    }
  };

  const handleAssignApp = (userId, appName, role) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            assignedApps: [...user.assignedApps, { appName, role }] 
          } 
        : user
    ));
  };

  const handleRemoveAssignment = (userId, appName) => {
    setUsers(users.map(user =>
      user.id === userId
        ? {
            ...user,
            assignedApps: user.assignedApps.filter(app => app.appName !== appName)
          }
        : user
    ));
  };

  return (
    <div className="user-management-container">
      <h3>User Management</h3>
      <div className="add-user-form">
        <input
          type="text"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          placeholder="Enter new user name"
        />
        <button onClick={handleAddUser}>Add User</button>
      </div>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <div className="user-assignments">
                <strong>Assigned Applications:</strong>
                {user.assignedApps.length > 0 ? (
                  user.assignedApps.map((assignment, index) => (
                    <div key={index} className="assignment-tag">
                      {assignment.appName} ({assignment.role})
                      <button 
                        className="remove-assignment"
                        onClick={() => handleRemoveAssignment(user.id, assignment.appName)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="no-assignments">No applications assigned</span>
                )}
              </div>
            </div>
            <div className="assignment-controls">
              <select
                onChange={(e) => {
                  const [appName, role] = e.target.value.split('|');
                  handleAssignApp(user.id, appName, role);
                  e.target.value = '';
                }}
                defaultValue=""
              >
                <option value="" disabled>Assign to Application</option>
                {applications.map(app => (
                  app.roles.map(role => (
                    <option 
                      key={`${app.id}-${role}`} 
                      value={`${app.name}|${role}`}
                    >
                      {app.name} - {role}
                    </option>
                  ))
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserManagement; 