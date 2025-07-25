/**
 * Admin Flow API - Main service aggregator
 * Single Responsibility: Provide unified access to all admin flow services
 * Following Facade Pattern for simplified client interaction
 */

import OrganizationService from './OrganizationService.js';
import UserService from './UserService.js';
import SystemConfigService from './SystemConfigService.js';

/**
 * Main Admin Flow API Class
 * Aggregates all admin flow services into a single interface
 */
export class AdminFlowAPI {
  constructor() {
    // Dependency Injection - inject service instances
    this.organizations = OrganizationService;
    this.users = UserService;
    this.system = SystemConfigService;
  }

  // Quick access methods for common operations
  async getDashboardData() {
    try {
      const [dashboard, analytics, notifications] = await Promise.all([
        this.system.getDashboard(),
        this.system.getAnalytics({ period: '30d' }),
        this.system.getNotifications()
      ]);

      return {
        dashboard,
        analytics,
        notifications,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  async getOverviewStats() {
    try {
      const [userSummary, orgList] = await Promise.all([
        this.users.getUserSummary(),
        this.organizations.getOrganizations()
      ]);

      return {
        users: userSummary,
        organizations: orgList,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch overview stats:', error);
      throw error;
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const response = await this.system.getDashboard();
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }
}

// Export singleton instance
const adminFlowAPI = new AdminFlowAPI();
export default adminFlowAPI;

// Export individual services for direct access if needed
export {
  OrganizationService,
  UserService,
  SystemConfigService
};
