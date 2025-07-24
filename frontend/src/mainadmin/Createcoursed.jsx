import React, { useEffect, useState } from "react";
import useCourseStore from "../store/Adminstors";

const Createcoursed = () => {
  const {
    courses,
    fetchCourses,
    deleteCourse,
    loadingCourses,
    errorCourses,
  } = useCourseStore();
  const [expandedCourses, setExpandedCourses] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line
  }, []);

  const toggleCourse = (courseId) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await deleteCourse(id);
    setDeletingId(null);
  };

  return (
    <div className="p-6 bg-white min-h-screen text-black">
      <h2 className="text-3xl font-bold mb-6">Created Courses</h2>
      {loadingCourses ? (
        <p className="text-gray-500">Loading courses...</p>
      ) : errorCourses ? (
        <p className="text-red-500">Error: {errorCourses}</p>
      ) : courses.length === 0 ? (
        <p className="text-gray-500">No courses created yet.</p>
      ) : (
        <ul className="space-y-6">
          {courses.map((course) => (
            <li
              key={course.id}
              className="p-5 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
            >
              {/* Course Header */}
              <div className="flex justify-between items-center mb-2">
                <div className="text-xl font-semibold">{course.name}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="text-black text-2xl hover:text-gray-600"
                  >
                    {expandedCourses[course.id] ? "\u2304" : "\u203a"}
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="border border-red-600 text-red-600 px-3 py-0.5 rounded hover:bg-red-600 hover:text-white transition text-sm"
                    disabled={deletingId === course.id}
                  >
                    {deletingId === course.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
              {/* Description */}
              {course.description && (
                <div className="mb-2 text-gray-700 text-sm">{course.description}</div>
              )}
              {/* Modules (future) */}
              {expandedCourses[course.id] && (
                <div className="text-gray-400 text-xs">(Modules feature coming soon)</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Createcoursed;
