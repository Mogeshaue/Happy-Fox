import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Target,
  FileText,
  Library,
  BarChart3,
  Trophy,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';

const StudentSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/student/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and progress'
    },
    {
      id: 'courses',
      label: 'My Courses',
      path: '/student/courses',
      icon: BookOpen,
      description: 'Enrolled courses'
    },
    {
      id: 'study-groups',
      label: 'Study Groups',
      path: '/student/study-groups',
      icon: Users,
      description: 'Collaborative learning'
    },
    {
      id: 'goals',
      label: 'Learning Goals',
      path: '/student/goals',
      icon: Target,
      description: 'Set and track goals'
    },
    {
      id: 'assignments',
      label: 'Assignments',
      path: '/student/assignments',
      icon: FileText,
      description: 'Submit and track'
    },
    {
      id: 'resources',
      label: 'Resources',
      path: '/student/resources',
      icon: Library,
      description: 'Learning materials'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      path: '/student/analytics',
      icon: BarChart3,
      description: 'Performance insights'
    },
    {
      id: 'achievements',
      label: 'Achievements',
      path: '/student/achievements',
      icon: Trophy,
      description: 'Badges and milestones'
    }
  ];

  const secondaryItems = [
    {
      id: 'profile',
      label: 'Profile',
      path: '/student/profile',
      icon: User,
      description: 'Manage your profile'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      path: '/student/calendar',
      icon: Calendar,
      description: 'Schedule and events'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Student Portal</h2>
            <p className="text-xs text-gray-500">Learning Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="px-3">
          {/* Main Menu Items */}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title={item.description}
                >
                  <Icon 
                    className={`mr-3 h-5 w-5 ${
                      active ? 'text-blue-700' : 'text-gray-400'
                    }`} 
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-gray-200" />

          {/* Secondary Menu Items */}
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Personal
            </h3>
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title={item.description}
                >
                  <Icon 
                    className={`mr-3 h-5 w-5 ${
                      active ? 'text-blue-700' : 'text-gray-400'
                    }`} 
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            Need Help?
          </h4>
          <p className="text-xs text-blue-700 mb-2">
            Access our learning resources and support
          </p>
          <button
            onClick={() => navigate('/student/support')}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Get Support →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSidebar;
