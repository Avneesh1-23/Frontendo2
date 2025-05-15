import React from 'react';
import '../styles/Login.css';

function Login({ onLogin }) {
  return (
    <div className="login-container">
      <h2>Secrets Management System</h2>
      <div className="login-buttons">
        <button onClick={() => onLogin('super')}>Super User</button>
        <button onClick={() => onLogin('admin')}>Admin</button>
        <button onClick={() => onLogin('end')}>End User</button>
      </div>
    </div>
  );
}

export default Login; 