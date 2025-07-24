import React from 'react'
import { Routes, Route } from "react-router-dom";
import AdminLayout from './AdminLayout';
import AddCourses from './Addcourses';

import Createcoursed from './Createcoursed';
import { Toaster } from 'react-hot-toast';
import AdminStudents from './AdminStudents';
import AdminMentor from './AdminMentor';
import AdminDashboard from './AdminDashboard';
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
     
    </Route>

    {/* You can add public routes here */}
    {/* <Route path="/" element={<HomePage />} /> */}
  </Routes>
  </div>
  )
}

export default AdminRoute