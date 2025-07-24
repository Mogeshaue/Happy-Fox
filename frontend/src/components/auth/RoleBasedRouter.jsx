import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginPage from './LoginPage';
import RoleInterfaceFactory from './factories/RoleInterfaceFactory';
import ErrorHandlingService from './services/ErrorHandlingService';

/**
 * Multi-Role Selector Component
 * Single Responsibility: Handle role switching UI
 */
const MultiRoleSelector = ({ roles, currentRole, onRoleSwitch }) => {
  if (roles.length <= 1) return null;

  return (
    <div className="role-selector">
      <div className="role-selector-header">
        <h3>Multiple Roles Available</h3>
        <p>You have access to multiple roles. Choose your active role:</p>
      </div>
      <div className="role-buttons">
        {roles.map((role) => (
          <button
            key={role}
            className={`role-btn ${currentRole === role ? 'active' : ''}`}
            onClick={() => onRoleSwitch(role)}
            aria-pressed={currentRole === role}
          >
            {role === 'admin' && '👑 Admin Dashboard'}
            {role === 'mentor' && '🎓 Mentor Portal'}
            {role === 'student' && '📚 Student Learning'}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Debug Panel Component
 * Single Responsibility: Show debug information in development
 */
const DebugPanel = ({ user, roles, primaryRole, activeRole, errors }) => {
  if (process.env.NODE_ENV !== 'development') return null;

  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="debug-panel">
      <button 
        className="debug-toggle"
        onClick={() => setShowDebug(!showDebug)}
      >
        🐛 Debug {showDebug ? '▼' : '▶'}
      </button>
      
      {showDebug && (
        <div className="debug-content">
          <h4>🔍 Authentication Debug</h4>
          <div className="debug-grid">
            <div><strong>User:</strong> {user?.email || 'None'}</div>
            <div><strong>All Roles:</strong> {roles?.join(', ') || 'None'}</div>
            <div><strong>Primary Role:</strong> {primaryRole || 'None'}</div>
            <div><strong>Active Role:</strong> {activeRole || 'None'}</div>
            <div><strong>Registered Roles:</strong> {RoleInterfaceFactory.getRegisteredRoles().join(', ')}</div>
          </div>
          
          {errors.length > 0 && (
            <div className="debug-errors">
              <h5>Recent Errors:</h5>
              {errors.slice(0, 3).map(error => (
                <div key={error.id} className="debug-error">
                  <small>{error.timestamp}</small>: {error.message}
                </div>
              ))}
            </div>
          )}
          
          <button 
            className="debug-btn"
            onClick={() => console.log('Auth State:', { user, roles, primaryRole, activeRole })}
          >
            Log Full State
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Role-Based Router Component
 * Single Responsibility: Coordinate role-based UI rendering
 * Open/Closed: Extensible for new roles through factory
 * Liskov Substitution: All role interfaces are interchangeable
 * Interface Segregation: Clean separation of concerns
 * Dependency Inversion: Depends on abstractions, not concrete implementations
 */
const RoleBasedRouter = () => {
  const authContext = useAuth();
  const { 
    isAuthenticated, 
    primaryRole, 
    roles = [], 
    isLoading, 
    error: authError,
    roleDetails,
    user
  } = authContext;

  // State management
  const [activeRole, setActiveRole] = useState(primaryRole);
  const [roleInterface, setRoleInterface] = useState(null);
  const [errors, setErrors] = useState([]);
  const [renderError, setRenderError] = useState(null);

  // Update active role when primary role changes
  useEffect(() => {
    if (primaryRole && primaryRole !== activeRole) {
      setActiveRole(primaryRole);
    }
  }, [primaryRole, activeRole]);

  /**
   * Handle role switching
   * Single Responsibility: Manage role transitions
   */
  const handleRoleSwitch = useCallback((newRole) => {
    try {
      console.log(`🔄 Switching from ${activeRole} to ${newRole}`);
      
      // Cleanup current interface
      if (roleInterface?.cleanup) {
        roleInterface.cleanup();
      }
      
      setActiveRole(newRole);
      setRenderError(null);
      
    } catch (error) {
      const errorInfo = ErrorHandlingService.handleRoleError(
        error, 
        newRole, 
        { action: 'role_switch', fromRole: activeRole }
      );
      
      setErrors(prev => [errorInfo, ...prev.slice(0, 9)]); // Keep last 10 errors
      console.error('Role switch failed:', error);
    }
  }, [activeRole, roleInterface]);

  /**
   * Create and cache role interface
   * Dependency Inversion: Uses factory abstraction
   */
  useEffect(() => {
    if (!activeRole || !user) {
      setRoleInterface(null);
      return;
    }

    try {
      console.log(`🏗️ Creating interface for role: ${activeRole}`);
      
      const newInterface = RoleInterfaceFactory.createRoleInterface(
        activeRole,
        roleDetails?.[activeRole] || {},
        authContext
      );
      
      setRoleInterface(newInterface);
      setRenderError(null);
      
    } catch (error) {
      const errorInfo = ErrorHandlingService.handleRoleError(
        error, 
        activeRole, 
        { action: 'interface_creation' }
      );
      
      setErrors(prev => [errorInfo, ...prev.slice(0, 9)]);
      setRenderError(errorInfo.userMessage);
      console.error('Interface creation failed:', error);
    }
  }, [activeRole, user, roleDetails, authContext]);

  /**
   * Handle authentication errors
   */
  useEffect(() => {
    if (authError) {
      const errorInfo = ErrorHandlingService.handleAuthError(
        authError, 
        { action: 'authentication' }
      );
      
      setErrors(prev => [errorInfo, ...prev.slice(0, 9)]);
    }
  }, [authError]);

  // Loading state
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
        <DebugPanel 
          user={user} 
          roles={roles} 
          primaryRole={primaryRole} 
          activeRole={activeRole}
          errors={errors}
        />
      </div>
    );
  }

  // Authentication required
  if (!isAuthenticated()) {
    return (
      <>
        <LoginPage />
        <DebugPanel 
          user={user} 
          roles={roles} 
          primaryRole={primaryRole} 
          activeRole={activeRole}
          errors={errors}
        />
      </>
    );
  }

  // Error state
  if (authError || renderError) {
    return (
      <div className="auth-error">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <h2>Interface Error</h2>
          <p>{renderError || authError}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()}>
              Refresh Page
            </button>
            <button onClick={() => {
              setRenderError(null);
              setActiveRole(primaryRole);
            }}>
              Reset to Primary Role
            </button>
          </div>
        </div>
        <DebugPanel 
          user={user} 
          roles={roles} 
          primaryRole={primaryRole} 
          activeRole={activeRole}
          errors={errors}
        />
      </div>
    );
  }

  // No interface available
  if (!roleInterface) {
    return (
      <div className="no-interface">
        <div className="interface-header">
          <h1>🎯 Setting up your dashboard...</h1>
          <p>Active Role: {activeRole}</p>
        </div>
        <MultiRoleSelector 
          roles={roles} 
          currentRole={activeRole} 
          onRoleSwitch={handleRoleSwitch} 
        />
        <DebugPanel 
          user={user} 
          roles={roles} 
          primaryRole={primaryRole} 
          activeRole={activeRole}
          errors={errors}
        />
      </div>
    );
  }

  // Render role interface
  try {
    return (
      <div className="role-based-app">
        {/* Role Selector for multi-role users */}
        {roles.length > 1 && (
          <div className="role-selector-container">
            <MultiRoleSelector 
              roles={roles} 
              currentRole={activeRole} 
              onRoleSwitch={handleRoleSwitch} 
            />
          </div>
        )}
        
        {/* Role Interface */}
        <div className="role-interface-container">
          {roleInterface.render()}
        </div>
        
        {/* Debug Panel */}
        <DebugPanel 
          user={user} 
          roles={roles} 
          primaryRole={primaryRole} 
          activeRole={activeRole}
          errors={errors}
        />
      </div>
    );
    
  } catch (error) {
    // Catch rendering errors
    const errorInfo = ErrorHandlingService.handleRoleError(
      error, 
      activeRole, 
      { action: 'interface_rendering' }
    );
    
    return (
      <div className="render-error">
        <div className="error-content">
          <span className="error-icon">💥</span>
          <h2>Rendering Error</h2>
          <p>{errorInfo.userMessage}</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
        <DebugPanel 
          user={user} 
          roles={roles} 
          primaryRole={primaryRole} 
          activeRole={activeRole}
          errors={[errorInfo, ...errors]}
        />
      </div>
    );
  }
};

export default RoleBasedRouter; 