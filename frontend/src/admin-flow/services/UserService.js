/**
 * User Management Service
 * Single Responsibility: Handle all user-related API operations
 */

import ApiClient from './ApiClient.js';

/**
 * User Service Interface (Interface Segregation Principle)
 */
export class IUserService {
  async getUsers() { throw new Error('Not implemented'); }
  async getUser(id) { throw new Error('Not implemented'); }
  async createUser(data) { throw new Error('Not implemented'); }
  async updateUser(id, data) { throw new Error('Not implemented'); }
  async deleteUser(id) { throw new Error('Not implemented'); }
  async getUserSummary() { throw new Error('Not implemented'); }
}

/**
 * User Service Implementation
 */
export class UserService extends IUserService {
  constructor(apiClient) {
    super();
    this.apiClient = apiClient; // Dependency Inversion
  }

  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/users/?${queryString}` : '/users/';
    return await this.apiClient.get(endpoint);
  }

  async getUser(id) {
    return await this.apiClient.get(`/users/${id}/`);
  }

  async createUser(data) {
    return await this.apiClient.post('/users/', data);
  }

  async updateUser(id, data) {
    return await this.apiClient.patch(`/users/${id}/`, data);
  }

  async deleteUser(id) {
    return await this.apiClient.delete(`/users/${id}/`);
  }

  async getUserSummary() {
    return await this.apiClient.get('/users/summary/');
  }

  async bulkImportUsers(usersData) {
    return await this.apiClient.post('/bulk/import-users/', {
      users: usersData,
      import_type: 'bulk_create'
    });
  }

  async exportUsers(format = 'csv') {
    return await this.apiClient.get(`/bulk/export/?format=${format}&type=users`);
  }

  async getUsersByOrganization(orgId) {
    return await this.apiClient.get(`/users/?organization=${orgId}`);
  }

  async updateUserRole(userId, role, organizationId) {
    return await this.apiClient.patch(`/users/${userId}/`, {
      role,
      organization_id: organizationId
    });
  }

  async deactivateUser(userId) {
    return await this.apiClient.patch(`/users/${userId}/`, {
      is_active: false,
      deactivated_at: new Date().toISOString()
    });
  }

  async activateUser(userId) {
    return await this.apiClient.patch(`/users/${userId}/`, {
      is_active: true,
      activated_at: new Date().toISOString()
    });
  }

  async resetUserPassword(userId) {
    return await this.apiClient.post(`/users/${userId}/reset-password/`);
  }
}

// Export singleton instance
export default new UserService(ApiClient);
