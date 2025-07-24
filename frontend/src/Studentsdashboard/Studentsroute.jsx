import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Studentdashboars from './Studentdashboars';
import StudentLayout from './StudentLayout';
import Mycourses from './Mycourses';
import CompletedCourses from './CompletedCourses';
import Profile from './Profile';
import Support from './Support';


const StudentRoute = () => {
  return (
    <div>
      <Toaster />
      <Routes>
        {/* Student Routes */}
        <Route path="/" element={<StudentLayout />}>
          <Route path="dashboard-student" element={<Studentdashboars />} />
          <Route path="mycourse-student" element={<Mycourses />} />
          <Route path="completed-student" element={<CompletedCourses />} />
          <Route path="profile-student" element={<Profile />} />
          <Route path="support-student" element={<Support />} />
           
        </Route>

        {/* Public or guest routes (optional) */}
        {/* <Route path="/" element={<LandingPage />} /> */}
      </Routes>
    </div>
  );
};

export default StudentRoute;
