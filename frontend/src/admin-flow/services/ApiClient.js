/**
 * Base API Configuration for Admin Flow
 * Following SOLID principles - Single Responsibility: API configuration
 */

const API_BASE_URL = 'http://127.0.0.1:8000/admin-flow/api';

/**
 * Interface for API client (Interface Segregation Principle)
 */
export class IApiClient {
  async get(endpoint) { throw new Error('Not implemented'); }
  async post(endpoint, data) { throw new Error('Not implemented'); }
  async put(endpoint, data) { throw new Error('Not implemented'); }
  async patch(endpoint, data) { throw new Error('Not implemented'); }
  async delete(endpoint) { throw new Error('Not implemented'); }
}

/**
 * HTTP Client Implementation (Dependency Inversion Principle)
 */
export class HttpClient extends IApiClient {
  constructor(baseURL = API_BASE_URL) {
    super();
    this.baseURL = baseURL;
  }

  getAuthHeaders() {
    const authData = localStorage.getItem('auth_data');
    if (authData) {
      try {
        const { access_token } = JSON.parse(authData);
        return {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        };
      } catch (error) {
        console.error('Failed to parse auth data:', error);
      }
    }
    return { 'Content-Type': 'application/json' };
  }

  async makeRequest(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method,
      headers: this.getAuthHeaders(),
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(`API ${method} request failed:`, error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.makeRequest('GET', endpoint);
  }

  async post(endpoint, data) {
    return this.makeRequest('POST', endpoint, data);
  }

  async put(endpoint, data) {
    return this.makeRequest('PUT', endpoint, data);
  }

  async patch(endpoint, data) {
    return this.makeRequest('PATCH', endpoint, data);
  }

  async delete(endpoint) {
    return this.makeRequest('DELETE', endpoint);
  }
}

export default new HttpClient();
