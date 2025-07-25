import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { IRoleInterface } from './IRoleInterface.js';
import StudentRoutes from '../../../student/StudentRoutes.jsx';

/**
 * Student Interface Implementation
 * Single Responsibility: Handle Student-specific UI and routing
 */
export class StudentInterface extends IRoleInterface {
  constructor(roleData, authContext) {
    super(roleData, authContext);
    this.roleName = 'student';
  }

  /**
   * Render Student interface with proper routing
   */
  render() {
    const { user, getUserDisplayName } = this.authContext;
    
    return (
      <div className="student-interface" role="main" aria-label="Student Portal">
        {/* Debug information */}
        <div className="debug-info" style={{ padding: '10px', background: '#f0f0f0', fontSize: '12px' }}>
          <strong>Debug - Student Interface:</strong> User: {getUserDisplayName()}, Role: {this.roleName}
        </div>

        {/* Student Routes - Direct routing to student app */}
        <Routes>
          <Route path="/student/*" element={<StudentRoutes />} />
          <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
        </Routes>
      </div>
    );
  }

  /**
   * Get student-specific navigation items
   */
  getNavigationItems() {
    return [
      { id: 'dashboard', label: 'Dashboard', path: '/student/dashboard', icon: 'LayoutDashboard' },
      { id: 'courses', label: 'My Courses', path: '/student/courses', icon: 'BookOpen' },
      { id: 'study-groups', label: 'Study Groups', path: '/student/study-groups', icon: 'Users' },
      { id: 'goals', label: 'Learning Goals', path: '/student/goals', icon: 'Target' },
      { id: 'assignments', label: 'Assignments', path: '/student/assignments', icon: 'FileText' },
      { id: 'resources', label: 'Resources', path: '/student/resources', icon: 'Library' },
      { id: 'analytics', label: 'Analytics', path: '/student/analytics', icon: 'BarChart3' },
      { id: 'achievements', label: 'Achievements', path: '/student/achievements', icon: 'Trophy' },
      { id: 'profile', label: 'Profile', path: '/student/profile', icon: 'User' }
    ];
  }

  /**
   * Student-specific permissions
   */
  hasPermission(permission) {
    const studentPermissions = [
      'view_courses', 'submit_assignments', 'join_study_groups', 
      'access_resources', 'view_progress', 'update_profile',
      'view_analytics', 'manage_goals'
    ];
    return studentPermissions.includes(permission);
  }

  /**
   * Student-specific cleanup
   */
  cleanup() {
    super.cleanup();
    console.log('Cleaning up student interface');
  }
}

export default StudentInterface; 