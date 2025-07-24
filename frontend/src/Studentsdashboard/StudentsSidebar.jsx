import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle,
  UserCircle,
  MessageSquare,
} from "lucide-react";

const StudentSidebar = () => {
  return (
    <div className="h-screen w-64 bg-white border-r shadow-sm fixed top-0 left-0 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-10">Student Panel</h2>

      <nav className="flex flex-col space-y-4">
        <NavLink
          to="dashboard-student"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-all ${
              isActive
                ? "bg-blue-600 text-white font-semibold"
                : "text-gray-700 hover:text-black hover:bg-gray-100"
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="mycourse-student"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-all ${
              isActive
                ? "bg-blue-600 text-white font-semibold"
                : "text-gray-700 hover:text-black hover:bg-gray-100"
            }`
          }
        >
          <BookOpen size={20} />
          <span>My Courses</span>
        </NavLink>

        <NavLink
          to="completed-student"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-all ${
              isActive
                ? "bg-blue-600 text-white font-semibold"
                : "text-gray-700 hover:text-black hover:bg-gray-100"
            }`
          }
        >
          <CheckCircle size={20} />
          <span>Completed Courses</span>
        </NavLink>

        <NavLink
          to="profile-student"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-all ${
              isActive
                ? "bg-blue-600 text-white font-semibold"
                : "text-gray-700 hover:text-black hover:bg-gray-100"
            }`
          }
        >
          <UserCircle size={20} />
          <span>Profile</span>
        </NavLink>

        <NavLink
          to="support-student"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-all ${
              isActive
                ? "bg-blue-600 text-white font-semibold"
                : "text-gray-700 hover:text-black hover:bg-gray-100"
            }`
          }
        >
          <MessageSquare size={20} />
          <span>Support</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default StudentSidebar;
