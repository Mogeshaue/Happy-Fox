import { httpClient, API_CONFIG } from './ApiService';

// Authentication Service - Single Responsibility for authentication
export class AuthenticationService {
  constructor(httpClient) {
    this.httpClient = httpClient;
    this.user = null;
    this.authCallbacks = [];
  }

  // Observer pattern for auth state changes
  subscribe(callback) {
    this.authCallbacks.push(callback);
    return () => {
      this.authCallbacks = this.authCallbacks.filter(cb => cb !== callback);
    };
  }

  notifyAuthChange() {
    this.authCallbacks.forEach(callback => callback(this.user));
  }

  async googleLogin(credential) {
    try {
      const data = await this.httpClient.post(API_CONFIG.ENDPOINTS.GOOGLE_AUTH, {
        credential
      });
      
      this.user = data.user;
      this.notifyAuthChange();
      return data;
    } catch (error) {
      throw new Error(`Google login failed: ${error.message}`);
    }
  }

  async testLogin(email = 'test@example.com') {
    try {
      const data = await this.httpClient.post(API_CONFIG.ENDPOINTS.TEST_LOGIN, {
        email,
        method: 'simple_test'
      });
      
      this.user = data.user || { email, method: 'Simple Test' };
      this.notifyAuthChange();
      return data;
    } catch (error) {
      throw new Error(`Test login failed: ${error.message}`);
    }
  }

  logout() {
    this.user = null;
    this.notifyAuthChange();
  }

  isAuthenticated() {
    return this.user !== null;
  }

  getCurrentUser() {
    return this.user;
  }
}

export const authService = new AuthenticationService(httpClient);
