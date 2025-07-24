import React, { useState } from "react";
import useCourseStore from "../store/Adminstors";
import { toast } from "react-hot-toast";

const AddCourses = () => {
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const { addCourse, errorCourses } = useCourseStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (courseName.trim()) {
      setLoading(true);
      await addCourse(courseName, description);
      setLoading(false);
      if (!errorCourses) {
        setCourseName("");
        setDescription("");
        toast.success("Course added!");
      } else {
        toast.error(errorCourses);
      }
    }
  };

  return (
    <div className="h-screen w-full bg-white flex justify-center  px-4">
      <div className="bg-gray-100 p-10 rounded-lg shadow-md w-full  h-[300px]">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Course</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Course Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="flex gap-4 justify-center">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
            <button
              type="button"
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
              onClick={() => window.history.back()}
              disabled={loading}
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
