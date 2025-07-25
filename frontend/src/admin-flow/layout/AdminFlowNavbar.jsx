/**
 * Admin Flow Navbar Component
 * Single Responsibility: Provide top navigation for admin flow pages
 * Following mentor navbar pattern for consistency
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Settings, LogOut, User } from 'lucide-react';
import useAdminFlowStore from '../store/adminFlowStore.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { COLORS } from '../utils/constants.js';

const AdminFlowNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use centralized auth context
  const { user, logout: authLogout, getUserDisplayName } = useAuth();
  
  const { 
    notifications,
    fetchNotifications,
    markAllNotificationsRead
  } = useAdminFlowStore();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Admin Dashboard';
    if (path.includes('/organizations')) return 'Organizations';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/system')) return 'System Configuration';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/notifications')) return 'Notifications';
    return 'Admin Flow';
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    // Set up interval to refresh notifications
    const interval = setInterval(fetchNotifications, 60000); // Every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleLogout = () => {
    authLogout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or filter current page
      console.log('Admin Flow Search:', searchQuery);
      // You can implement search functionality here
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllNotificationsRead();
      setShowNotifications(false);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const unreadNotificationCount = notifications?.filter(notif => !notif.is_read)?.length || 0;

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Left Section - Page Title and Breadcrumb */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search organizations, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </form>
      </div>

      {/* Right Section - Notifications and Profile */}
      <div className="flex items-center space-x-4">
        {/* Quick Action Button */}
        <button
          onClick={() => navigate('/admin-flow/system')}
          className="hidden md:flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm">Settings</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          !notification.is_read ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                )}
              </div>
              {notifications && notifications.length > 5 && (
                <div className="p-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      navigate('/admin-flow/notifications');
                      setShowNotifications(false);
                    }}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
              style={{ backgroundColor: COLORS.PRIMARY }}
            >
              {getUserDisplayName()?.charAt(0) || 'A'}
            </div>
            <span className="hidden md:block text-sm font-medium">{getUserDisplayName()}</span>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <button
                  onClick={() => {
                    navigate('/admin-flow/profile');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/admin-flow/system');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showProfileDropdown || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileDropdown(false);
            setShowNotifications(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminFlowNavbar;
