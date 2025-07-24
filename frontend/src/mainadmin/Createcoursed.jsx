import React, { useState } from "react";
import useCourseStore from "../store/Adminstors";

const Createcoursed = () => {
  const { courses, addModule } = useCourseStore();
  const [newModules, setNewModules] = useState({});
  const [expandedCourses, setExpandedCourses] = useState({});

  const handleAddModule = (courseId) => {
    const moduleName = newModules[courseId];
    if (!moduleName?.trim()) return;

    addModule(courseId, moduleName);
    setNewModules({ ...newModules, [courseId]: "" });
  };

  const toggleCourse = (courseId) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  return (
    <div className="p-6 bg-white min-h-screen text-black">
      <h2 className="text-3xl font-bold mb-6">Created Courses</h2>

      {courses.length === 0 ? (
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
                <button
                  onClick={() => toggleCourse(course.id)}
                  className="text-black text-2xl hover:text-gray-600"
                >
                  {expandedCourses[course.id] ? "⌄" : "›"}
                </button>
              </div>

              {/* Modules */}
              {expandedCourses[course.id] && (
                <>
                  {course.modules?.length > 0 && (
                    <ul className="space-y-2">
                      {course.modules.map((mod) => (
                        <li
                          key={mod.id}
                          className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                        >
                          <span>{mod.name}</span>
                          <div className="flex gap-2">
                            <button className="border border-blue-600 text-blue-600 px-3 py-0.5 rounded hover:bg-blue-600 hover:text-white transition text-sm">
                               Edit
                            </button>
                            <button className="border border-green-600 text-green-600 px-3 py-0.5 rounded hover:bg-green-600 hover:text-white transition text-sm">
                               Preview
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Add Module Input */}
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add module"
                      value={newModules[course.id] || ""}
                      onChange={(e) =>
                        setNewModules({
                          ...newModules,
                          [course.id]: e.target.value,
                        })
                      }
                      className="border border-gray-300 bg-gray-100 px-3 py-1 rounded w-full"
                    />
                    <button
                      onClick={() => handleAddModule(course.id)}
                      className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
                    >
                      Add
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Createcoursed;
