import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

const api = {
  // Applications
  getApplications: async () => {
    const response = await axios.get(`${API_BASE_URL}/applications`);
    return response.data;
  },

  createApplication: async (application) => {
    const response = await axios.post(`${API_BASE_URL}/applications`, application);
    return response.data;
  },

  updateApplication: async (id, application) => {
    const response = await axios.put(`${API_BASE_URL}/applications/${id}`, application);
    return response.data;
  },

  deleteApplication: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/applications/${id}`);
    return response.data;
  },

  // Users
  getUsers: async () => {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  },

  createUser: async (user) => {
    const response = await axios.post(`${API_BASE_URL}/users`, user);
    return response.data;
  },

  updateUser: async (id, user) => {
    const response = await axios.put(`${API_BASE_URL}/users/${id}`, user);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/users/${id}`);
    return response.data;
  },

  // Roles
  getRoles: async () => {
    const response = await axios.get(`${API_BASE_URL}/roles`);
    return response.data;
  },

  createRole: async (role) => {
    const response = await axios.post(`${API_BASE_URL}/roles`, role);
    return response.data;
  },

  updateRole: async (id, role) => {
    const response = await axios.put(`${API_BASE_URL}/roles/${id}`, role);
    return response.data;
  },

  deleteRole: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/roles/${id}`);
    return response.data;
  },

  // User Applications
  getUserApplications: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/applications`);
    return response.data;
  },

  assignUserToApplication: async (userId, applicationId, roleId) => {
    const response = await axios.post(`${API_BASE_URL}/users/${userId}/applications`, {
      application_id: applicationId,
      role_id: roleId
    });
    return response.data;
  },

  removeUserFromApplication: async (userId, applicationId) => {
    const response = await axios.delete(`${API_BASE_URL}/users/${userId}/applications/${applicationId}`);
    return response.data;
  },

  // Authentication
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  },

  logout: async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/logout`);
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (filters = {}) => {
    const response = await axios.get(`${API_BASE_URL}/audit-logs`, { params: filters });
    return response.data;
  },

  // App Admin specific endpoints
  getAppAdminApplications: async () => {
    const response = await axios.get(`${API_BASE_URL}/app-admin/applications`);
    return response.data;
  },

  assignAppAdmin: async (userId, appId) => {
    const response = await axios.post(`${API_BASE_URL}/app-admin/assignments`, {
      user_id: userId,
      app_id: appId
    });
    return response.data;
  },

  removeAppAdmin: async (userId, appId) => {
    const response = await axios.delete(`${API_BASE_URL}/app-admin/assignments/${userId}/${appId}`);
    return response.data;
  },

  getAppAdminUsers: async (appId) => {
    const response = await axios.get(`${API_BASE_URL}/app-admin/applications/${appId}/users`);
    return response.data;
  },
};

// Add request interceptor for authentication
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };
