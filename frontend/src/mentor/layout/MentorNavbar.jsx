import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Settings, LogOut, User } from 'lucide-react';
import useMentorStore from '../store/mentorStore.js';
import { COLORS } from '../utils/constants.js';

const MentorNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    mentorProfile, 
    unreadMessageCount, 
    fetchUnreadMessageCount 
  } = useMentorStore();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/students')) return 'Students';
    if (path.includes('/sessions')) return 'Sessions';
    if (path.includes('/messages')) return 'Messages';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/profile')) return 'Profile';
    return 'Mentor Hub';
  };

  // Fetch unread message count on component mount
  useEffect(() => {
    fetchUnreadMessageCount();
    // Set up interval to refresh unread count
    const interval = setInterval(fetchUnreadMessageCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [fetchUnreadMessageCount]);

  const handleLogout = () => {
    // Clear local storage and redirect to login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or filter current page
      console.log('Search:', searchQuery);
    }
  };

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
              placeholder="Search students, sessions, messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </form>
      </div>

      {/* Right Section - Actions and Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {unreadMessageCount > 0 ? (
                  <div className="p-4">
                    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {unreadMessageCount} new messages
                        </p>
                        <p className="text-xs text-gray-500">
                          Click to view all messages
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <Bell size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                )}
              </div>
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
              style={{ backgroundColor: mentorProfile?.user?.default_dp_color || COLORS.PRIMARY }}
            >
              {mentorProfile?.user?.first_name?.charAt(0) || 'M'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">
                {mentorProfile?.user?.full_name || 'Mentor'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {mentorProfile?.experience_level || 'Mentor'}
              </p>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-gray-100">
                <p className="font-medium text-gray-900">
                  {mentorProfile?.user?.full_name || 'Mentor'}
                </p>
                <p className="text-sm text-gray-500">
                  {mentorProfile?.user?.email}
                </p>
              </div>
              
              <div className="py-2">
                <button
                  onClick={() => {
                    navigate('/mentor/profile');
                    setShowProfileDropdown(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/mentor/settings');
                    setShowProfileDropdown(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
              </div>
              
              <div className="border-t border-gray-100 py-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
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
        ></div>
      )}
    </div>
  );
};

export default MentorNavbar; 