// API Configuration - Single Responsibility for API settings
export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8000/api',
  ENDPOINTS: {
    GOOGLE_AUTH: '/google-oauth-login/',
    TEST_LOGIN: '/test-student-login/',
    ADMIN: {
      COURSES: '/admin/courses/',
      COHORTS: '/admin/cohorts/',
      TEAMS: '/admin/teams/',
      INVITATIONS: '/admin/invitations/',
    }
  },
  GOOGLE_CLIENT_ID: '305743130332-tsr28ldgeeadlrgr7udg816o0ll8iean.apps.googleusercontent.com'
};

// HTTP Client - Single Responsibility for HTTP operations
export class HttpClient {
  constructor(baseURL = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      console.error('HTTP Request failed:', error);
      throw error;
    }
  }

  async get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  async post(endpoint, data, headers = {}) {
    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, headers = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

export const httpClient = new HttpClient();
