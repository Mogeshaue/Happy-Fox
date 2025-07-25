/**
 * Student Flow Layout Component
 * Single Responsibility: Provide layout structure for student pages
 * Open/Closed: Extensible for new layout features
 * Liskov Substitution: Consistent layout interface
 * Interface Segregation: Focused on layout concerns
 * Dependency Inversion: Depends on layout abstractions
 */

import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import StudentFlowNavbar from './StudentFlowNavbar';
import StudentFlowSidebar from './StudentFlowSidebar';
import useStudentFlowStore from '../store/studentFlowStore';

const StudentFlowLayout = () => {
  const { studentId, setStudentId, fetchDashboardData } = useStudentFlowStore();

  useEffect(() => {
    // Initialize student ID from auth context or localStorage
    const initializeStudent = () => {
      // For now, use a mock student ID
      // In production, this would come from the auth context
      const mockStudentId = localStorage.getItem('studentId') || 'student-123';
      setStudentId(mockStudentId);
    };

    initializeStudent();
  }, [setStudentId]);

  useEffect(() => {
    if (studentId) {
      fetchDashboardData();
    }
  }, [studentId, fetchDashboardData]);

  return (
    <div className="min-h-screen bg-gray-50">
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
            duration: 3000,
            style: {
              background: '#10B981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#EF4444',
            },
          },
        }}
      />

      {/* Layout Container */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <StudentFlowSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation */}
          <StudentFlowNavbar />

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentFlowLayout;
