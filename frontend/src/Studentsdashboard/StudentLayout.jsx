import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentsSidebar';
import Adminnavbar from '../mainadmin/Adminnavbar';


const StudentLayout = () => {
  return (
    <div className="flex">
      {/* Sidebar stays fixed on the left */}
      <StudentSidebar />

      {/* Main content area (includes navbar and routed content) */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Adminnavbar />

        {/* Routed page content */}
        <div className="p-6 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
