import React from "react";
import useCourseStore from "../store/Adminstors";
import { BookOpen, Users, GraduationCap } from "lucide-react";

const AdminDashboard = () => {
  const { courses, students, mentors } = useCourseStore();

  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg shadow p-6 text-center">
            <div className="flex justify-center mb-4">
              <BookOpen size={36} className="text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Courses</h2>
            <p className="text-4xl font-bold text-blue-600">{courses.length}</p>
          </div>

          <div className="bg-gray-50 rounded-lg shadow p-6 text-center">
            <div className="flex justify-center mb-4">
              <Users size={36} className="text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Students</h2>
            <p className="text-4xl font-bold text-green-600">{students.length}</p>
          </div>

          <div className="bg-gray-50 rounded-lg shadow p-6 text-center">
            <div className="flex justify-center mb-4">
              <GraduationCap size={36} className="text-purple-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Mentors</h2>
            <p className="text-4xl font-bold text-purple-600">{mentors.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
