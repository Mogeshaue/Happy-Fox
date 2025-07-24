import React from "react";

const AddCourses = () => {
  return (
    <div className="h-screen w-full bg-white flex justify-center px-4">
      <div className="bg-gray-100 p-10 rounded-lg shadow-md w-full h-[250px] max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Course</h1>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Course Name"
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-4 justify-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Create Course
            </button>
            <button
              type="button"
             className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourses;
