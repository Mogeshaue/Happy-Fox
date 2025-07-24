import React from 'react'
import { Routes, Route } from "react-router-dom";
import AdminLayout from './AdminLayout';
import AddCourses from './Addcourses';
import Createcourse from './Createcourse';
const AdminRoute = () => {
  return (
    <Routes>
    {/* Admin routes */}
    <Route path="/" element={<AdminLayout/>}>
    
      <Route path="addcourse" element={<AddCourses/>} />
      <Route path="create-course" element={<Createcourse />} />
     
    </Route>

    {/* You can add public routes here */}
    {/* <Route path="/" element={<HomePage />} /> */}
  </Routes>
  )
}

export default AdminRoute