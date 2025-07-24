import React, { useState } from "react";
import useCourseStore from "../store/Adminstors";
import ModuleList from "./Modulelist";

const Createcoursed = () => {
  const { courses, addModule } = useCourseStore();
  const [newModules, setNewModules] = useState({});
  const [expandedCourses, setExpandedCourses] = useState({});

  const handleAddModule = (courseId) => {
    const moduleData = newModules[courseId];
    if (!moduleData?.name?.trim()) return;

    addModule(courseId, moduleData.name, moduleData.content || "");
    setNewModules({ ...newModules, [courseId]: { name: "", content: "" } });
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

              {/* Expanded Details */}
              {expandedCourses[course.id] && (
                <>
                  {/* Module List */}
                  {course.modules?.length > 0 && (
                    <ModuleList modules={course.modules} />
                  )}

                  {/* Add Module Form */}
                  <div className="mt-4 space-y-2">
                    <input
                      type="text"
                      placeholder="Module name"
                      value={newModules[course.id]?.name || ""}
                      onChange={(e) =>
                        setNewModules({
                          ...newModules,
                          [course.id]: {
                            ...(newModules[course.id] || {}),
                            name: e.target.value,
                          },
                        })
                      }
                      className="border border-gray-300 bg-gray-100 px-3 py-1 rounded w-full"
                    />

                    <textarea
                      placeholder="Module content"
                      rows={3}
                      value={newModules[course.id]?.content || ""}
                      onChange={(e) =>
                        setNewModules({
                          ...newModules,
                          [course.id]: {
                            ...(newModules[course.id] || {}),
                            content: e.target.value,
                          },
                        })
                      }
                      className="border border-gray-300 bg-gray-100 px-3 py-1 rounded w-full"
                    />

                    <button
                      onClick={() => handleAddModule(course.id)}
                      className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
                    >
                      Add Module
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
