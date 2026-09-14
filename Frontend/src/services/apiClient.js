const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    try {
      return localStorage.getItem('hiresense_token') || sessionStorage.getItem('hiresense_token') || '';
    } catch {
      return '';
    }
  }

  setToken(token) {
    try {
      localStorage.setItem('hiresense_token', token);
      sessionStorage.setItem('hiresense_token', token);
    } catch (e) {
      console.warn('Could not persist token:', e);
    }
  }

  clearToken() {
    try {
      localStorage.removeItem('hiresense_token');
      sessionStorage.removeItem('hiresense_token');
    } catch (e) {
      console.warn('Could not clear token:', e);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      ...options.headers,
    };

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch {
          errorData = { detail: response.statusText };
        }
        const error = new Error(errorData?.detail || `API request failed with status ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      // Return blob or json
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      } else if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
        return await response.text();
      }
      return await response.blob();
    } catch (err) {
      console.warn(`[HireSense API] Request to ${url} encountered:`, err.message);
      throw err;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
