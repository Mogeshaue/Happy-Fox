import AdminInterface from '../interfaces/AdminInterface.jsx';
import MentorInterface from '../interfaces/MentorInterface.jsx';
import StudentInterface from '../interfaces/StudentInterface.jsx';

/**
 * Role Interface Factory
 * Follows Dependency Inversion Principle - depends on abstractions, not concrete implementations
 * Follows Open/Closed Principle - open for extension, closed for modification
 */
export class RoleInterfaceFactory {
  static roleRegistry = new Map();

  /**
   * Register a new role interface (Open/Closed Principle)
   * Allows adding new roles without modifying existing code
   */
  static registerRole(roleName, InterfaceClass) {
    this.roleRegistry.set(roleName, InterfaceClass);
  }

  /**
   * Create role interface based on role name
   * @param {string} roleName - The role name
   * @param {Object} roleData - Role-specific data
   * @param {Object} authContext - Authentication context
   * @returns {IRoleInterface} Role interface instance
   */
  static createRoleInterface(roleName, roleData, authContext) {
    // Validate inputs
    if (!roleName) {
      throw new Error('Role name is required');
    }

    if (!authContext) {
      throw new Error('Authentication context is required');
    }

    // Get interface class from registry
    const InterfaceClass = this.roleRegistry.get(roleName);
    
    if (!InterfaceClass) {
      console.warn(`Unknown role: ${roleName}. Available roles:`, Array.from(this.roleRegistry.keys()));
      return this.createDefaultInterface(roleName, roleData, authContext);
    }

    try {
      const roleInterface = new InterfaceClass(roleData, authContext);
      console.log(`Created ${roleName} interface successfully`);
      return roleInterface;
    } catch (error) {
      console.error(`Failed to create ${roleName} interface:`, error);
      return this.createDefaultInterface(roleName, roleData, authContext);
    }
  }

  /**
   * Create default interface for unknown roles
   */
  static createDefaultInterface(roleName, roleData, authContext) {
    return {
      roleName: roleName || 'unknown',
      render: () => (
        <div className="default-interface">
          <div className="interface-header">
            <h1>🎯 Welcome to Happy Fox LMS</h1>
            <p>Role: {roleName} not fully configured yet.</p>
          </div>
          <div className="debug-info">
            <h3>Debug Information:</h3>
            <p><strong>Role:</strong> {roleName}</p>
            <p><strong>User:</strong> {authContext.getUserDisplayName()}</p>
            <p><strong>Available Roles:</strong> {Array.from(this.roleRegistry.keys()).join(', ')}</p>
          </div>
        </div>
      ),
      getNavigationItems: () => [],
      hasPermission: () => false,
      cleanup: () => console.log(`Cleaning up default interface for ${roleName}`)
    };
  }

  /**
   * Get all registered roles
   */
  static getRegisteredRoles() {
    return Array.from(this.roleRegistry.keys());
  }

  /**
   * Check if role is registered
   */
  static isRoleRegistered(roleName) {
    return this.roleRegistry.has(roleName);
  }
}

// Register default role interfaces
RoleInterfaceFactory.registerRole('admin', AdminInterface);
RoleInterfaceFactory.registerRole('mentor', MentorInterface);
RoleInterfaceFactory.registerRole('student', StudentInterface);

export default RoleInterfaceFactory; 