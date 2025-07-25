import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import StudentNavbar from './StudentNavbar.jsx';
import StudentSidebar from './StudentSidebar.jsx';
import StudentAPI from '../services/StudentAPI.js';

const StudentLayout = () => {
  // Initialize student data on layout mount
  useEffect(() => {
    const initializeStudentData = async () => {
      try {
        // You can add any initialization logic here
        // For example, verify student profile exists
        const authData = localStorage.getItem('auth_data');
        if (authData) {
          try {
            const auth = JSON.parse(authData);
            if (auth.user?.id) {
              // Try to get student profile, create if doesn't exist
              try {
                await StudentAPI.getProfile();
              } catch (error) {
                if (error.message.includes('profile')) {
                  // Profile doesn't exist, create one
                  await StudentAPI.createProfile({
                    bio: '',
                    learning_style: 'mixed',
                    preferred_difficulty: 'intermediate'
                  });
                }
              }
            }
          } catch (error) {
            console.warn('Failed to parse auth data:', error);
          }
        }
      } catch (error) {
        console.error('Failed to initialize student data:', error);
      }
    };

    initializeStudentData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <StudentSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <StudentNavbar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
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

export default StudentLayout;
