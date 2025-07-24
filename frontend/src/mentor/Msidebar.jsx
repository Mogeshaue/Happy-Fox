import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ListTodo,
  Users,
  GraduationCap,
} from "lucide-react";

const Msidebar = () => {
  return (
    <div className="h-screen w-64 bg-white border-r shadow-sm fixed top-0 left-0 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-10">Admin Panel</h2>

      <nav className="flex flex-col space-y-4">
        <NavLink
          to="dashboard"
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
          to="addcourse"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-all ${
              isActive
                ? "bg-blue-600 text-white font-semibold"
                : "text-gray-700 hover:text-black hover:bg-gray-100"
            }`
          }
        >
          <BookOpen size={20} />
          <span>Add Courses</span>
        </NavLink>

        <NavLink
          to="create-course"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-all ${
              isActive
                ? "bg-blue-600 text-white font-semibold"
                : "text-gray-700 hover:text-black hover:bg-gray-100"
            }`
          }
        >
          <ListTodo size={20} />
          <span>Created Courses</span>
        </NavLink>

        <NavLink
          to="Add-students"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-all ${
              isActive
                ? "bg-blue-600 text-white font-semibold"
                : "text-gray-700 hover:text-black hover:bg-gray-100"
            }`
          }
        >
          <Users size={20} />
          <span>Add Students</span>
        </NavLink>

        <NavLink
          to="Add-mentors"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-all ${
              isActive
                ? "bg-blue-600 text-white font-semibold"
                : "text-gray-700 hover:text-black hover:bg-gray-100"
            }`
          }
        >
          <GraduationCap size={20} />
          <span>Add Mentors</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Msidebar;
