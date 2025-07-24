import React from 'react';

const Adminnavbar = () => {
  return (
    <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
      
      <div className="flex items-center gap-4">
        {/* Example items */}
        <span className="text-gray-600">Admin</span>
        <img
          src="https://via.placeholder.com/32"
          alt="profile"
          className="w-8 h-8 rounded-full"
        />
      </div>
    </div>
  );
};

export default Adminnavbar;
