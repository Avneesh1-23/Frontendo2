import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import './styles/App.css';
import './styles/theme.css';

function App() {
  const [userType, setUserType] = useState(null);
  const [theme, setTheme] = useState(() => {
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Update document class when theme changes
    document.documentElement.setAttribute('data-theme', theme);
    // Save theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogin = (type) => {
    setUserType(type);
  };

  const handleLogout = () => {
    setUserType(null);
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App" data-theme={theme}>
      {!userType ? (
        <Login onLogin={handleLogin} theme={theme} onThemeToggle={toggleTheme} />
      ) : (
        <Dashboard 
          userType={userType} 
          onLogout={handleLogout}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      )}
    </div>
  );
}

export default App; 