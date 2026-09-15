import { apiClient } from './apiClient';

export const authService = {
  async register(userData) {
    const response = await apiClient.post('/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'recruiter',
    });
    if (response.access_token) {
      apiClient.setToken(response.access_token);
    }
    return response;
  },

  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.access_token) {
      apiClient.setToken(response.access_token);
    }
    return response;
  },

  async getMe() {
    return apiClient.get('/auth/me');
  },

  async forgotPassword(email) {
    return apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(email, newPassword) {
    return apiClient.post('/auth/reset-password', {
      email,
      new_password: newPassword,
    });
  },

  logout() {
    apiClient.clearToken();
  }
};

