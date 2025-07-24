
import React from 'react';
import { BookOpen, CheckCircle, FileText } from 'lucide-react';

const Studentdashboars = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome to Your Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <BookOpen className="text-indigo-600" size={32} />
            <div>
              <h2 className="text-xl font-semibold text-gray-700">My Courses</h2>
              <p className="text-gray-500">View and manage your enrolled courses.</p>
            </div>
          </div>
        </div>

        {/* Completed Courses */}
        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <CheckCircle className="text-green-600" size={32} />
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Completed Courses</h2>
              <p className="text-gray-500">Track your progress and achievements.</p>
            </div>
          </div>
        </div>

        {/* Certificates or Resources */}
        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <FileText className="text-yellow-600" size={32} />
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Resources</h2>
              <p className="text-gray-500">Download certificates, notes, and more.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studentdashboars;
