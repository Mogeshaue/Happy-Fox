import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MentorNavbar from './MentorNavbar.jsx';
import MentorSidebar from './MentorSidebar.jsx';
import useMentorStore from '../store/mentorStore.js';

const MentorLayout = () => {
  const { 
    fetchMentorProfile, 
    fetchUnreadMessageCount,
    mentorProfile 
  } = useMentorStore();

  // Initialize mentor data on layout mount
  useEffect(() => {
    const initializeMentorData = async () => {
      try {
        // Fetch mentor profile if not already loaded
        if (!mentorProfile) {
          await fetchMentorProfile();
        }
        
        // Fetch unread message count
        await fetchUnreadMessageCount();
      } catch (error) {
        console.error('Failed to initialize mentor data:', error);
      }
    };

    initializeMentorData();
  }, [fetchMentorProfile, fetchUnreadMessageCount, mentorProfile]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Fixed on the left */}
      <MentorSidebar />

      {/* Main content area */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <MentorNavbar />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default MentorLayout; 