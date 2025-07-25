import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Loader from '../loading/Loading';
// adjust the path to your Loader component

// Lazy load each page
const StudentDashboard = lazy(() => import('./Studentdashboars'));
const StudentLayout = lazy(() => import('./StudentLayout'));
const MyCourses = lazy(() => import('./Mycourses'));
const CompletedCourses = lazy(() => import('./CompletedCourses'));
const Profile = lazy(() => import('./Profile'));
const Support = lazy(() => import('./Support'));

const StudentRoute = () => {
  return (
    <div>
      <Toaster />
      <Suspense fallback={<Loader/>}>
        <Routes>
          {/* Student Routes */}
          <Route path="/" element={<StudentLayout />}>
            <Route path="dashboard-student" element={<StudentDashboard />} />
            <Route path="mycourse-student" element={<MyCourses />} />
            <Route path="completed-student" element={<CompletedCourses />} />
            <Route path="profile-student" element={<Profile />} />
            <Route path="support-student" element={<Support />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
};

export default StudentRoute;
