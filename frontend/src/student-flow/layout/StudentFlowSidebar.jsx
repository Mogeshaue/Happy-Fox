/**
 * Student Flow Sidebar Component
 * Single Responsibility: Provide navigation sidebar for student interface
 * Open/Closed: Extensible for new navigation items
 * Liskov Substitution: Consistent sidebar interface
 * Interface Segregation: Focused on navigation concerns
 * Dependency Inversion: Depends on navigation abstractions
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Users,
  BookOpen,
  Calendar,
  Award,
  Target
} from 'lucide-react';
import { NAVIGATION_ITEMS } from '../constants/constants';
import useStudentFlowStore from '../store/studentFlowStore';

const StudentFlowSidebar = () => {
  const location = useLocation();
  const { overviewStats } = useStudentFlowStore();

  const getIcon = (iconName) => {
    const icons = {
      LayoutDashboard,
      TrendingUp,
      FileText,
      Users,
      BookOpen,
      Calendar,
      Award,
      Target
    };
    const Icon = icons[iconName] || LayoutDashboard;
    return <Icon size={20} />;
  };

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Student Portal</h2>
            <p className="text-sm text-gray-500">Learning Dashboard</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {overviewStats && (
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {overviewStats.overallProgress}%
              </div>
              <div className="text-xs text-gray-500">Overall Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {overviewStats.studyStreak}
              </div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {overviewStats.assignmentsPending}
              </div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {overviewStats.studyGroupsActive}
              </div>
              <div className="text-xs text-gray-500">Groups</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <div className="space-y-2">
          {NAVIGATION_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive || isActiveRoute(item.path)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
              title={item.description}
            >
              <div className="flex-shrink-0">
                {getIcon(item.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium">{item.label}</span>
                {/* Show pending count for assignments */}
                {item.id === 'assignments' && overviewStats?.assignmentsPending > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {overviewStats.assignmentsPending}
                  </span>
                )}
                {/* Show active count for study groups */}
                {item.id === 'study-groups' && overviewStats?.studyGroupsActive > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-500 rounded-full">
                    {overviewStats.studyGroupsActive}
                  </span>
                )}
              </div>
            </NavLink>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Target size={16} />
              <span>Set Study Goal</span>
            </button>
            <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Calendar size={16} />
              <span>Schedule Study</span>
            </button>
            <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Award size={16} />
              <span>View Achievements</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-sm text-gray-500">
            Keep learning, keep growing! 🚀
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFlowSidebar;
