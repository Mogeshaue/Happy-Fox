import React from 'react';
import { Outlet } from 'react-router-dom';
import Adminnavbar from './Adminnavbar';
import AdminSidebar from './Adminsidebar';

const AdminLayout = () => {
  return (
    <div className="flex">
      {/* Sidebar stays fixed on the left */}
      <AdminSidebar />

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

export default AdminLayout;
