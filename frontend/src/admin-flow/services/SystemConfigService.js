/**
 * System Configuration Service
 * Single Responsibility: Handle system configuration and settings
 */

import ApiClient from './ApiClient.js';

/**
 * System Configuration Service Interface
 */
export class ISystemConfigService {
  async getConfiguration() { throw new Error('Not implemented'); }
  async updateConfiguration(data) { throw new Error('Not implemented'); }
  async getDashboard() { throw new Error('Not implemented'); }
  async getAnalytics() { throw new Error('Not implemented'); }
}

/**
 * System Configuration Service Implementation
 */
export class SystemConfigService extends ISystemConfigService {
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
  }

  async getConfiguration() {
    return await this.apiClient.get('/system-config/');
  }

  async updateConfiguration(data) {
    return await this.apiClient.post('/system-config/', data);
  }

  async getDashboard() {
    return await this.apiClient.get('/dashboard/');
  }

  async getAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/analytics/?${queryString}` : '/analytics/';
    return await this.apiClient.get(endpoint);
  }

  async getAdminActions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/actions/?${queryString}` : '/actions/';
    return await this.apiClient.get(endpoint);
  }

  async getNotifications() {
    return await this.apiClient.get('/notifications/');
  }

  async markAllNotificationsRead() {
    return await this.apiClient.post('/notifications/mark-all-read/');
  }

  async generateContent(contentData) {
    return await this.apiClient.post('/generate/', contentData);
  }

  async getGenerationStatus(jobId) {
    return await this.apiClient.get(`/generate/${jobId}/status/`);
  }

  async bulkEnrollment(enrollmentData) {
    return await this.apiClient.post('/bulk/enrollment/', enrollmentData);
  }

  async exportData(exportType, format = 'csv') {
    return await this.apiClient.get(`/bulk/export/?type=${exportType}&format=${format}`);
  }
}

// Export singleton instance
export default new SystemConfigService(ApiClient);
