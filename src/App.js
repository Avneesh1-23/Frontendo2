import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import './styles/App.css';

function App() {
  const [userType, setUserType] = useState(null);

  const handleLogin = (type) => {
    setUserType(type);
  };

  return (
    <div className="App">
      {!userType ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard userType={userType} />
      )}
    </div>
  );
}

export default App; 