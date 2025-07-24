import axios from 'axios';
import { MENTOR_API_BASE } from '../utils/constants.js';
import toast from 'react-hot-toast';

class BaseAPI {
  constructor() {
    this.client = axios.create({
      baseURL: MENTOR_API_BASE,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle API errors consistently
   * @param {Object} error - Axios error object
   */
  handleError(error) {
    let message = 'An unexpected error occurred';

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          message = data.message || data.error || 'Bad request';
          break;
        case 401:
          message = 'Authentication required';
          // Redirect to login if needed
          this.handleUnauthorized();
          break;
        case 403:
          message = 'Access forbidden';
          break;
        case 404:
          message = 'Resource not found';
          break;
        case 422:
          message = this.formatValidationErrors(data);
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        default:
          message = data.message || data.error || 'Request failed';
      }
    } else if (error.request) {
      // Request made but no response received
      message = 'Network error. Please check your connection.';
    }

    // Show error toast
    toast.error(message);
    
    // Log error for debugging
    console.error('API Error:', error);
  }

  /**
   * Handle unauthorized access
   */
  handleUnauthorized() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    // You might want to redirect to login page here
    // window.location.href = '/login';
  }

  /**
   * Format validation errors from backend
   * @param {Object} data - Error response data
   * @returns {string} Formatted error message
   */
  formatValidationErrors(data) {
    if (data.errors && typeof data.errors === 'object') {
      const errorMessages = Object.values(data.errors).flat();
      return errorMessages.join(', ');
    }
    return data.message || data.error || 'Validation failed';
  }

  /**
   * GET request
   * @param {string} url - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise} Response data
   */
  async get(url, params = {}) {
    try {
      const response = await this.client.get(url, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST request
   * @param {string} url - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise} Response data
   */
  async post(url, data = {}) {
    try {
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT request
   * @param {string} url - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise} Response data
   */
  async put(url, data = {}) {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PATCH request
   * @param {string} url - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise} Response data
   */
  async patch(url, data = {}) {
    try {
      const response = await this.client.patch(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE request
   * @param {string} url - API endpoint
   * @returns {Promise} Response data
   */
  async delete(url) {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload file
   * @param {string} url - API endpoint
   * @param {FormData} formData - File data
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Response data
   */
  async upload(url, formData, onProgress = null) {
    try {
      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        } : undefined,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('auth_token', token);
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('auth_token');
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Get current auth token
   * @returns {string|null} Current token
   */
  getAuthToken() {
    return localStorage.getItem('auth_token');
  }
}

// Create singleton instance
const baseAPI = new BaseAPI();

export default baseAPI; 