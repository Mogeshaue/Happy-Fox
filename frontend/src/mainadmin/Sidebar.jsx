import React from "react";
import { Home, User, Settings } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-white shadow-lg fixed top-0 left-0 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">MyApp</h1>
      <nav className="flex flex-col space-y-4">
        <a href="#" className="flex items-center space-x-2 text-gray-700 hover:text-black">
          <Home size={20} />
          <span>Home</span>
        </a>
        <a href="#" className="flex items-center space-x-2 text-gray-700 hover:text-black">
          <User size={20} />
          <span>Profile</span>
        </a>
        <a href="#" className="flex items-center space-x-2 text-gray-700 hover:text-black">
          <Settings size={20} />
          <span>Settings</span>
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
