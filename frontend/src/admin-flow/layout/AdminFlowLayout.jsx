/**
 * Admin Flow Layout Component
 * Single Responsibility: Provide layout structure for admin flow pages
 * Following mentor layout pattern for consistency
 */

import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminFlowNavbar from './AdminFlowNavbar.jsx';
import AdminFlowSidebar from './AdminFlowSidebar.jsx';
import useAdminFlowStore from '../store/adminFlowStore.js';

const AdminFlowLayout = () => {
  const { 
    fetchDashboardData, 
    fetchNotifications,
    dashboardData,
    isInitialized,
    setInitialized
  } = useAdminFlowStore();

  // Initialize admin flow data on layout mount
  useEffect(() => {
    const initializeAdminFlowData = async () => {
      if (isInitialized) return;

      try {
        // Fetch dashboard data and notifications
        await Promise.all([
          fetchDashboardData(),
          fetchNotifications()
        ]);

        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize admin flow data:', error);
        // Set initialized anyway to prevent infinite loading
        setInitialized(true);
      }
    };

    initializeAdminFlowData();
  }, [fetchDashboardData, fetchNotifications, isInitialized, setInitialized]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Fixed on the left */}
      <AdminFlowSidebar />

      {/* Main content area */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <AdminFlowNavbar />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </div>
  );
};

export default AdminFlowLayout;
