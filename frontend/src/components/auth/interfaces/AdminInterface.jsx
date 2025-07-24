import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
      <Router>
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
      </Router>
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
    ];
  }

  /**
   * Admin-specific permissions
   */
  hasPermission(permission) {
    const adminPermissions = [
      'manage_users', 'manage_courses', 'manage_cohorts', 
      'manage_teams', 'send_invitations', 'view_analytics'
    ];
    return adminPermissions.includes(permission);
  }
}

export default AdminInterface; 