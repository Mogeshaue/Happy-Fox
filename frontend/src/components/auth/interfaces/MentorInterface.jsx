import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { IRoleInterface } from './IRoleInterface.js';
import MentorRoutes from '../../../mentor/MentorRoutes.jsx';

/**
 * Mentor Interface Implementation
 * Single Responsibility: Handle Mentor-specific UI and routing
 */
export class MentorInterface extends IRoleInterface {
  constructor(roleData, authContext) {
    super(roleData, authContext);
    this.roleName = 'mentor';
  }

  /**
   * Render Mentor interface with proper routing
   */
  render() {
    const { user, getUserDisplayName } = this.authContext;
    
    return (
      <Router>
        <div className="mentor-interface" role="main" aria-label="Mentor Portal">
          {/* Debug information */}
          <div className="debug-info" style={{ padding: '10px', background: '#f0f0f0', fontSize: '12px' }}>
            <strong>Debug - Mentor Interface:</strong> User: {getUserDisplayName()}, Role: {this.roleName}
          </div>

          {/* Mentor Routes - Direct routing to mentor app */}
          <Routes>
            <Route path="/mentor/*" element={<MentorRoutes />} />
            <Route path="*" element={<Navigate to="/mentor/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    );
  }

  /**
   * Get mentor-specific navigation items
   */
  getNavigationItems() {
    return [
      { id: 'dashboard', label: 'Dashboard', path: '/mentor/dashboard', icon: 'LayoutDashboard' },
      { id: 'students', label: 'Students', path: '/mentor/students', icon: 'Users' },
      { id: 'sessions', label: 'Sessions', path: '/mentor/sessions', icon: 'Calendar' },
      { id: 'messages', label: 'Messages', path: '/mentor/messages', icon: 'MessageSquare' },
      { id: 'analytics', label: 'Analytics', path: '/mentor/analytics', icon: 'BarChart3' },
      { id: 'profile', label: 'Profile', path: '/mentor/profile', icon: 'User' }
    ];
  }

  /**
   * Mentor-specific permissions
   */
  hasPermission(permission) {
    const mentorPermissions = [
      'view_students', 'manage_sessions', 'send_messages', 
      'view_progress', 'update_profile', 'view_analytics'
    ];
    return mentorPermissions.includes(permission);
  }

  /**
   * Mentor-specific cleanup
   */
  cleanup() {
    super.cleanup();
    // Clear mentor-specific data if needed
    console.log('Cleaning up mentor interface');
  }
}

export default MentorInterface; 