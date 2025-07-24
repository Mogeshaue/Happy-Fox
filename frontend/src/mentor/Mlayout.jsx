import React from 'react';
import { Outlet } from 'react-router-dom';
import Msidebar from './Msidebar';
import Mnavbar from './Mnavbar';


const Mlayout = () => {
  return (
    <div className="flex">
      {/* Sidebar stays fixed on the left */}
      < Msidebar/>

      {/* Main content area (includes navbar and routed content) */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Mnavbar/>

        {/* Routed page content */}
        <div className="p-6 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Mlayout;
