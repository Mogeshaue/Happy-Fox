/**
 * Organization Management Service
 * Single Responsibility: Handle all organization-related API operations
 */

import ApiClient from './ApiClient.js';

/**
 * Organization Service Interface (Interface Segregation Principle)
 */
export class IOrganizationService {
  async getOrganizations() { throw new Error('Not implemented'); }
  async getOrganization(id) { throw new Error('Not implemented'); }
  async createOrganization(data) { throw new Error('Not implemented'); }
  async updateOrganization(id, data) { throw new Error('Not implemented'); }
  async deleteOrganization(id) { throw new Error('Not implemented'); }
  async getOrganizationStats(id) { throw new Error('Not implemented'); }
}

/**
 * Organization Service Implementation
 */
export class OrganizationService extends IOrganizationService {
  constructor(apiClient) {
    super();
    this.apiClient = apiClient; // Dependency Inversion
  }

  async getOrganizations() {
    return await this.apiClient.get('/organizations/');
  }

  async getOrganization(id) {
    return await this.apiClient.get(`/organizations/${id}/`);
  }

  async createOrganization(data) {
    return await this.apiClient.post('/organizations/', data);
  }

  async updateOrganization(id, data) {
    return await this.apiClient.patch(`/organizations/${id}/`, data);
  }

  async deleteOrganization(id) {
    return await this.apiClient.delete(`/organizations/${id}/`);
  }

  async getOrganizationStats(id) {
    return await this.apiClient.get(`/organizations/${id}/stats/`);
  }

  async updateOrganizationSettings(id, settings) {
    return await this.apiClient.patch(`/organizations/${id}/`, { 
      ...settings,
      updated_at: new Date().toISOString()
    });
  }

  async getOrganizationUsers(id) {
    return await this.apiClient.get(`/organizations/${id}/users/`);
  }

  async addUserToOrganization(orgId, userData) {
    return await this.apiClient.post(`/organizations/${orgId}/users/`, userData);
  }

  async removeUserFromOrganization(orgId, userId) {
    return await this.apiClient.delete(`/organizations/${orgId}/users/${userId}/`);
  }
}

// Export singleton instance (following mentor pattern)
export default new OrganizationService(ApiClient);
