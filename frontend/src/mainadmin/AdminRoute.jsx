import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import Loader from '../loading/Loading';

// Lazy-loaded components
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const AddCourses = lazy(() => import('./Addcourses'));
const Createcoursed = lazy(() => import('./Createcoursed'));
const AdminStudents = lazy(() => import('./AdminStudents'));
const AdminMentor = lazy(() => import('./AdminMentor'));
const CohortManager = lazy(() => import('./CohortManager'));
const TeamManager = lazy(() => import('./TeamManager'));
const InvitationManager = lazy(() => import('./InvitationManager'));

const AdminRoute = () => {
  return (
    <div>
      <Toaster />
      <Suspense fallback={<div className="p-4 text-gray-500"><Loader/></div>}>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="addcourse" element={<AddCourses />} />
            <Route path="create-course" element={<Createcoursed />} />
            <Route path="Add-students" element={<AdminStudents />} />
            <Route path="Add-mentors" element={<AdminMentor />} />
            <Route path="cohorts" element={<CohortManager />} />
            <Route path="teams" element={<TeamManager />} />
            <Route path="invitations" element={<InvitationManager />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
};

export default AdminRoute;
