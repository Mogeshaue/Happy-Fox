/**
 * Student Flow Navbar Component
 * Single Responsibility: Provide top navigation for student interface
 * Open/Closed: Extensible for new navigation features
 * Liskov Substitution: Consistent navbar interface
 * Interface Segregation: Focused on navigation concerns
 * Dependency Inversion: Depends on navigation abstractions
 */

import React, { useState } from 'react';
import { Bell, Search, User, Settings, LogOut, Menu } from 'lucide-react';
import useStudentFlowStore from '../store/studentFlowStore';

const StudentFlowNavbar = () => {
  const { overviewStats, studentId } = useStudentFlowStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    {
      id: 1,
      type: 'assignment',
      title: 'Assignment Due Soon',
      message: 'React Todo App is due in 2 days',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'study_group',
      title: 'Study Group Meeting',
      message: 'React Study Circle starts in 30 minutes',
      time: '30 minutes ago',
      read: false
    },
    {
      id: 3,
      type: 'progress',
      title: 'Milestone Achieved',
      message: 'You completed 75% of React Development course!',
      time: '1 day ago',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = () => {
    // Implement logout functionality
    console.log('Logging out...');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Search */}
        <div className="flex items-center space-x-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} className="text-gray-600" />
          </button>
          
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search courses, assignments, groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        {/* Right Side - Stats & Actions */}
        <div className="flex items-center space-x-6">
          {/* Quick Stats */}
          {overviewStats && (
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{overviewStats.overallProgress}%</div>
                <div className="text-gray-500">Progress</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{overviewStats.studyStreak}</div>
                <div className="text-gray-500">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{overviewStats.assignmentsPending}</div>
                <div className="text-gray-500">Pending</div>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button className="text-blue-600 text-sm hover:text-blue-700">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                Student
              </span>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-medium text-gray-900">Student</p>
                  <p className="text-sm text-gray-500">{studentId}</p>
                </div>
                <div className="py-2">
                  <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                </div>
                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StudentFlowNavbar;
