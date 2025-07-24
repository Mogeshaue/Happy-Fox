import React from 'react';
import { IRoleInterface } from './IRoleInterface.js';
import StudentLayout from '../../../Studentsdashboard/StudentLayout.jsx';

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
   * Render Student interface
   */
  render() {
    const { user, getUserDisplayName } = this.authContext;
    
    return (
      <div className="student-interface" role="main" aria-label="Student Portal">
        {/* Student Header */}
        <div className="interface-header">
          <div className="header-content">
            <h1>📚 Student Learning Portal</h1>
            <div className="user-info">
              <span>Welcome, {getUserDisplayName()}</span>
              <span className="role-badge student">Student</span>
            </div>
          </div>
        </div>

        {/* Student Content */}
        <div className="student-content">
          <StudentLayout />
        </div>
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
      { id: 'completed', label: 'Completed', path: '/student/completed', icon: 'CheckCircle' },
      { id: 'profile', label: 'Profile', path: '/student/profile', icon: 'User' },
      { id: 'support', label: 'Support', path: '/student/support', icon: 'HelpCircle' }
    ];
  }

  /**
   * Student-specific permissions
   */
  hasPermission(permission) {
    const studentPermissions = [
      'view_courses', 'submit_assignments', 'view_progress', 
      'contact_mentors', 'update_profile', 'access_support'
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