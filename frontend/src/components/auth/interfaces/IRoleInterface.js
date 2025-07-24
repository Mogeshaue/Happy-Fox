/**
 * Interface for Role-based UI Components
 * Following Interface Segregation Principle
 */

export class IRoleInterface {
  constructor(roleData, authContext) {
    this.roleData = roleData;
    this.authContext = authContext;
  }

  /**
   * Render the role-specific interface
   * Must be implemented by concrete classes
   */
  render() {
    throw new Error('render() method must be implemented by concrete role class');
  }

  /**
   * Get role-specific navigation items
   */
  getNavigationItems() {
    throw new Error('getNavigationItems() method must be implemented by concrete role class');
  }

  /**
   * Handle role-specific cleanup
   */
  cleanup() {
    // Default implementation - can be overridden
    console.log(`Cleaning up ${this.constructor.name}`);
  }

  /**
   * Validate role permissions
   */
  hasPermission(permission) {
    return this.roleData.permissions?.includes(permission) || false;
  }
}

export default IRoleInterface; 