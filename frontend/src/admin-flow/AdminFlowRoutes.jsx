/**
 * Admin Flow Routes Component
 * Single Responsibility: Define routing for admin flow pages
 * Following mentor routes pattern for consistency
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminFlowLayout from './layout/AdminFlowLayout.jsx';

// Import page components (lazy loading for better performance)
const AdminFlowDashboard = React.lazy(() => import('./pages/AdminFlowDashboard.jsx'));
const OrganizationManagement = React.lazy(() => import('./pages/OrganizationManagement.jsx'));
const UserManagement = React.lazy(() => import('./pages/UserManagement.jsx'));
const SystemConfiguration = React.lazy(() => import('./pages/SystemConfiguration.jsx'));

// Loading component for suspense
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full w-8 h-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

const AdminFlowRoutes = () => {
  return (
    <Routes>
      {/* Admin Flow routes with layout */}
      <Route path="/admin-flow" element={<AdminFlowLayout />}>
        {/* Dashboard - Default route */}
        <Route 
          index 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <AdminFlowDashboard />
            </React.Suspense>
          } 
        />
        <Route 
          path="dashboard" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <AdminFlowDashboard />
            </React.Suspense>
          } 
        />

        {/* Organization Management */}
        <Route 
          path="organizations" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <OrganizationManagement />
            </React.Suspense>
          } 
        />
        <Route 
          path="organizations/:orgId" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <OrganizationManagement />
            </React.Suspense>
          } 
        />
        <Route 
          path="organizations/:orgId/edit" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <OrganizationManagement />
            </React.Suspense>
          } 
        />
        <Route 
          path="organizations/new" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <OrganizationManagement />
            </React.Suspense>
          } 
        />

        {/* User Management */}
        <Route 
          path="users" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <UserManagement />
            </React.Suspense>
          } 
        />
        <Route 
          path="users/:userId" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <UserManagement />
            </React.Suspense>
          } 
        />
        <Route 
          path="users/:userId/edit" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <UserManagement />
            </React.Suspense>
          } 
        />
        <Route 
          path="users/new" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <UserManagement />
            </React.Suspense>
          } 
        />

        {/* System Configuration */}
        <Route 
          path="system" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <SystemConfiguration />
            </React.Suspense>
          } 
        />

        {/* Analytics (placeholder for future implementation) */}
        <Route 
          path="analytics" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <AdminFlowDashboard />
            </React.Suspense>
          } 
        />

        {/* Notifications (placeholder for future implementation) */}
        <Route 
          path="notifications" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <AdminFlowDashboard />
            </React.Suspense>
          } 
        />

        {/* Catch-all route - redirect to dashboard */}
        <Route 
          path="*" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <AdminFlowDashboard />
            </React.Suspense>
          } 
        />
      </Route>
    </Routes>
  );
};

export default AdminFlowRoutes;
