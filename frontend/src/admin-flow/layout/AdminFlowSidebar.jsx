/**
 * Admin Flow Sidebar Component
 * Single Responsibility: Provide navigation for admin flow pages
 * Following mentor sidebar pattern for consistency
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ADMIN_FLOW_NAV_ITEMS, COLORS } from '../utils/constants.js';
import useAdminFlowStore from '../store/adminFlowStore.js';

const AdminFlowSidebar = () => {
  const location = useLocation();
  const { notifications, dashboardData } = useAdminFlowStore();

  const renderIcon = (iconName, size = 20) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent size={size} /> : <Icons.Settings size={size} />;
  };

  const getBadgeCount = (itemId) => {
    if (itemId === 'notifications') {
      const unreadCount = notifications?.filter(notif => !notif.is_read)?.length || 0;
      return unreadCount > 0 ? unreadCount : null;
    }
    return null;
  };

  const getAdminDisplayName = () => {
    const authData = localStorage.getItem('auth_data');
    if (authData) {
      try {
        const { user } = JSON.parse(authData);
        return user?.full_name || user?.first_name || 'Admin';
      } catch (error) {
        console.error('Failed to parse auth data:', error);
      }
    }
    return 'Admin';
  };

  const getAdminInitial = () => {
    const name = getAdminDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 shadow-sm fixed top-0 left-0 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Flow</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: COLORS.PRIMARY }}
          >
            {getAdminInitial()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{getAdminDisplayName()}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {ADMIN_FLOW_NAV_ITEMS.map((item) => {
          const badgeCount = getBadgeCount(item.id);
          const isActive = location.pathname === item.path || 
                          location.pathname.startsWith(item.path + '/');

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive: linkActive }) => {
                const active = linkActive || isActive;
                return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative ${
                  active
                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`;
              }}
            >
              <div className="relative">
                {renderIcon(item.icon)}
                {badgeCount && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <span className="text-sm font-medium">{item.label}</span>
                <p className="text-xs opacity-75 group-hover:opacity-100 transition-opacity">
                  {item.description}
                </p>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Admin Flow</span>
          <span>v1.0</span>
        </div>
      </div>
    </div>
  );
};

export default AdminFlowSidebar;
