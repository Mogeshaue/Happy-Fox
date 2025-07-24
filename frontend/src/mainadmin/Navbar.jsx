import React from "react";
import { Menu, X } from "lucide-react"; // Optional for mobile menu icon
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="text-xl font-bold text-gray-800">MyApp</div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-black">
              Home
            </a>
            <a href="#" className="text-gray-600 hover:text-black">
              About
            </a>
            <a href="#" className="text-gray-600 hover:text-black">
              Contact
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <a href="#" className="block text-gray-600 hover:text-black">
            Home
          </a>
          <a href="#" className="block text-gray-600 hover:text-black">
            About
          </a>
          <a href="#" className="block text-gray-600 hover:text-black">
            Contact
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
