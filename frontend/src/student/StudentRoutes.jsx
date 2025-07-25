import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentLayout from './layout/StudentLayout.jsx';

// Import page components (lazy loading for better performance)
const StudentDashboard = React.lazy(() => import('./StudentDashboard.jsx'));
const StudentProfile = React.lazy(() => import('./pages/StudentProfile.jsx'));
const StudentCourses = React.lazy(() => import('./pages/StudentCourses.jsx'));
const CourseDetails = React.lazy(() => import('./pages/CourseDetails.jsx'));
const StudyGroups = React.lazy(() => import('./pages/StudyGroups.jsx'));
const LearningGoals = React.lazy(() => import('./pages/LearningGoals.jsx'));
const Assignments = React.lazy(() => import('./pages/Assignments.jsx'));
const Analytics = React.lazy(() => import('./pages/Analytics.jsx'));
const Achievements = React.lazy(() => import('./pages/Achievements.jsx'));
const LearningResources = React.lazy(() => import('./pages/LearningResources.jsx'));

// Loading component for suspense
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full w-8 h-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

const StudentRoutes = () => {
  return (
    <Routes>
      {/* Student routes with layout */}
      <Route path="/student" element={<StudentLayout />}>
        {/* Dashboard - Default route */}
        <Route 
          index 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <StudentDashboard />
            </React.Suspense>
          } 
        />
        <Route 
          path="dashboard" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <StudentDashboard />
            </React.Suspense>
          } 
        />

        {/* Profile Management */}
        <Route 
          path="profile" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <StudentProfile />
            </React.Suspense>
          } 
        />

        {/* Course Management */}
        <Route 
          path="courses" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <StudentCourses />
            </React.Suspense>
          } 
        />
        <Route 
          path="courses/:courseId" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <CourseDetails />
            </React.Suspense>
          } 
        />

        {/* Study Groups */}
        <Route 
          path="study-groups" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <StudyGroups />
            </React.Suspense>
          } 
        />

        {/* Learning Goals */}
        <Route 
          path="goals" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <LearningGoals />
            </React.Suspense>
          } 
        />

        {/* Assignments */}
        <Route 
          path="assignments" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <Assignments />
            </React.Suspense>
          } 
        />

        {/* Learning Resources */}
        <Route 
          path="resources" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <LearningResources />
            </React.Suspense>
          } 
        />

        {/* Analytics */}
        <Route 
          path="analytics" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <Analytics />
            </React.Suspense>
          } 
        />

        {/* Achievements */}
        <Route 
          path="achievements" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <Achievements />
            </React.Suspense>
          } 
        />

        {/* Catch-all route - redirect to dashboard */}
        <Route 
          path="*" 
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <StudentDashboard />
            </React.Suspense>
          } 
        />
      </Route>
    </Routes>
  );
};

export default StudentRoutes;
