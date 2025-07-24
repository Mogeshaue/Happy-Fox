import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Studentdashboars from './Studentdashboars';
import StudentLayout from './StudentLayout';


const StudentRoute = () => {
  return (
    <div>
      <Toaster />
      <Routes>
        {/* Student Routes */}
        <Route path="/" element={<StudentLayout />}>
          <Route path="dashboard-student" element={<Studentdashboars />} />
           
        </Route>

        {/* Public or guest routes (optional) */}
        {/* <Route path="/" element={<LandingPage />} /> */}
      </Routes>
    </div>
  );
};

export default StudentRoute;
