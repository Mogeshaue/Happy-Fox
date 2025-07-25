import React from 'react';
import useCourseStore from '../store/Adminstors';

const Studentsnavbar = () => {
  const { authUser, logout } = useCourseStore();

  const handleLogout = () => {
    logout();
    // Optionally redirect to login/welcome page
  };

  if (!authUser) return null;

  const { first_name, default_dp_color } = authUser;

  return (
    <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-blue-600">Student Dashboard</h1>

      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-semibold"
          style={{ backgroundColor: default_dp_color || '#1e3a8a' }}
        >
          {first_name?.[0] || 'S'}
        </div>

        <span className="text-blue-600 font-medium">{first_name}</span>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Studentsnavbar;
