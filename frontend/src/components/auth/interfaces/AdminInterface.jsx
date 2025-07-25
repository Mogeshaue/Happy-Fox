import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { IRoleInterface } from './IRoleInterface.js';
import AdminRoute from '../../../mainadmin/AdminRoute.jsx';

/**
 * Admin Interface Implementation
 * Single Responsibility: Handle Admin-specific UI and routing
 */
export class AdminInterface extends IRoleInterface {
  constructor(roleData, authContext) {
    super(roleData, authContext);
    this.roleName = 'admin';
  }

  /**
   * Render Admin interface with proper routing
   */
  render() {
    const { user, getUserDisplayName } = this.authContext;
    
    return (
      <div className="admin-interface" role="main" aria-label="Admin Dashboard">
        {/* Admin Header */}
        <div className="interface-header">
          <div className="header-content">
            <h1>👑 Admin Dashboard</h1>
            <div className="user-info">
              <span>Welcome, {getUserDisplayName()}</span>
              <span className="role-badge admin">Administrator</span>
            </div>
          </div>
        </div>

        {/* Admin Routes */}
        <div className="admin-content">
          <Routes>
            <Route path="/admin/*" element={<AdminRoute />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    );
  }

  /**
   * Get admin-specific navigation items
   */
  getNavigationItems() {
    return [
      { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
      { id: 'courses', label: 'Courses', path: '/admin/addcourse', icon: 'BookOpen' },
      { id: 'students', label: 'Students', path: '/admin/Add-students', icon: 'Users' },
      { id: 'mentors', label: 'Mentors', path: '/admin/Add-mentors', icon: 'GraduationCap' },
      { id: 'cohorts', label: 'Cohorts', path: '/admin/cohorts', icon: 'Group' },
      { id: 'teams', label: 'Teams', path: '/admin/teams', icon: 'Team' },
      { id: 'invitations', label: 'Invitations', path: '/admin/invitations', icon: 'Mail' },
      { 
        id: 'admin-flow', 
        label: 'System Admin', 
        path: '/admin/admin-flow', 
        icon: 'Settings',
        children: [
          { id: 'admin-flow-dashboard', label: 'Overview', path: '/admin/admin-flow/dashboard', icon: 'BarChart3' },
          { id: 'organizations', label: 'Organizations', path: '/admin/admin-flow/organizations', icon: 'Building2' },
          { id: 'user-management', label: 'User Management', path: '/admin/admin-flow/users', icon: 'UserCog' },
          { id: 'system-config', label: 'System Config', path: '/admin/admin-flow/config', icon: 'Settings2' }
        ]
      },
    ];
  }

  /**
   * Admin-specific permissions
   */
  hasPermission(permission) {
    const adminPermissions = [
      'manage_users', 'manage_courses', 'manage_cohorts', 
      'manage_teams', 'send_invitations', 'view_analytics',
      'manage_organizations', 'system_configuration', 'admin_flow_access'
    ];
    return adminPermissions.includes(permission);
  }
}

export default AdminInterface; 