import React from 'react'
import { Routes, Route } from "react-router-dom";
import AdminLayout from './AdminLayout';
import AddCourses from './Addcourses';

import Createcoursed from './Createcoursed';
import { Toaster } from 'react-hot-toast';
import AdminStudents from './AdminStudents';
import AdminMentor from './AdminMentor';
import AdminDashboard from './AdminDashboard';
import CohortManager from './CohortManager';
import TeamManager from './TeamManager';
import InvitationManager from './InvitationManager';
import AdminFlowRoutes from '../admin-flow/AdminFlowRoutes';
const AdminRoute = () => {
  return (
  <div>
      <Toaster/>
    <Routes>
    {/* Admin routes */}
    <Route path="/" element={<AdminLayout/>}>
    
      <Route path="dashboard" element={<AdminDashboard/>} />
      <Route path="addcourse" element={<AddCourses/>} />
      <Route path="create-course" element={<Createcoursed />} />
      <Route path="Add-students" element={<AdminStudents />} />
      <Route path="Add-mentors" element={<AdminMentor />} />
      <Route path="cohorts" element={<CohortManager />} />
      <Route path="teams" element={<TeamManager />} />
      <Route path="invitations" element={<InvitationManager />} />
    </Route>

    {/* Admin Flow Routes */}
    <Route path="/admin-flow/*" element={<AdminFlowRoutes />} />

    {/* You can add public routes here */}
    {/* <Route path="/" element={<HomePage />} /> */}
  </Routes>
  </div>
  )
}

export default AdminRoute