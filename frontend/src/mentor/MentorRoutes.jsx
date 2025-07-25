import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MentorLayout from './layout/MentorLayout.jsx';

// Import page components (lazy loading for better performance)
const MentorDashboard = React.lazy(() => import('./pages/MentorDashboard.jsx'));
const MentorProfile = React.lazy(() => import('./pages/MentorProfile.jsx'));
const StudentList = React.lazy(() => import('./pages/Students/StudentList.jsx'));
const StudentDetails = React.lazy(() => import('./pages/Students/StudentDetails.jsx'));
const SessionCalendar = React.lazy(() => import('./pages/Sessions/SessionCalendar.jsx'));
const SessionList = React.lazy(() => import('./pages/Sessions/SessionList.jsx'));
const SessionDetails = React.lazy(() => import('./pages/Sessions/SessionDetails.jsx'));
const MessageList = React.lazy(() => import('./pages/Messages/MessageList.jsx'));
const MessageThread = React.lazy(() => import('./pages/Messages/MessageThread.jsx'));
const MentorAnalytics = React.lazy(() => import('./pages/Analytics/MentorAnalytics.jsx'));
const SessionCreate = React.lazy(() => import('./pages/Sessions/SessionCreate.jsx'));
const NewMessage = React.lazy(() => import('./pages/Messages/NewMessage.jsx'));

// Loading component for suspense
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full w-8 h-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

const MentorRoutes = () => {
  return (
    <Routes>
      {/* Mentor routes with layout */}
      <Route path="/mentor" element={<MentorLayout />}>
        {/* Dashboard - Default route */}
        <Route 
          index 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <MentorDashboard />
            </React.Suspense>
          } 
        />
        <Route 
          path="dashboard" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <MentorDashboard />
            </React.Suspense>
          } 
        />

        {/* Profile Management */}
        <Route 
          path="profile" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <MentorProfile />
            </React.Suspense>
          } 
        />

        {/* Student Management */}
        <Route 
          path="students" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <StudentList />
            </React.Suspense>
          } 
        />
        <Route 
          path="students/:studentId" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <StudentDetails />
            </React.Suspense>
          } 
        />

        {/* Session Management */}
        <Route 
          path="sessions" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <SessionList />
            </React.Suspense>
          } 
        />
        <Route 
          path="sessions/calendar" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <SessionCalendar />
            </React.Suspense>
          } 
        />
        <Route 
          path="sessions/new" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <SessionCreate />
            </React.Suspense>
          } 
        />
        <Route 
          path="sessions/:sessionId" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <SessionDetails />
            </React.Suspense>
          } 
        />

        {/* Communication */}
        <Route 
          path="messages" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <MessageList />
            </React.Suspense>
          } 
        />
        <Route 
          path="messages/new" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <NewMessage />
            </React.Suspense>
          } 
        />
        <Route 
          path="messages/:assignmentId" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <MessageThread />
            </React.Suspense>
          } 
        />

        {/* Analytics */}
        <Route 
          path="analytics" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <MentorAnalytics />
            </React.Suspense>
          } 
        />

        {/* Catch-all route - redirect to dashboard */}
        <Route 
          path="*" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <MentorDashboard />
            </React.Suspense>
          } 
        />
      </Route>
    </Routes>
  );
};

export default MentorRoutes; 