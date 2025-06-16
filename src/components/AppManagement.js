const handleAddApp = async (e) => {
  e.preventDefault();
  if (!newApp.app_name || !newApp.app_url || !newApp.app_icon) {
    setError('Please fill in all fields');
    return;
  }

  try {
    // Create new app object
    const app = {
      app_id: Date.now(), // Use timestamp as unique ID
      app_name: newApp.app_name,
      app_url: newApp.app_url,
      app_icon: newApp.app_icon,
      created_at: new Date().toISOString()
    };

    // Add to applications list
    setApplications(prevApps => [...prevApps, app]);

    setSuccess('Application added successfully');
    setNewApp({ app_name: '', app_url: '', app_icon: '' });
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    setError('Failed to add application');
    setTimeout(() => setError(null), 3000);
  }
};

const handleDeleteApp = async (appId) => {
  try {
    // Remove from applications list
    setApplications(prevApps => prevApps.filter(app => app.app_id !== appId));

    setSuccess('Application deleted successfully');
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    setError('Failed to delete application');
    setTimeout(() => setError(null), 3000);
  }
};

const handleUpdateApp = async (appId) => {
  try {
    // Update in applications list
    setApplications(prevApps => prevApps.map(app => 
      app.app_id === appId ? { ...app, ...editingApp } : app
    ));

    setSuccess('Application updated successfully');
    setEditingApp(null);
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    setError('Failed to update application');
    setTimeout(() => setError(null), 3000);
  }
}; 