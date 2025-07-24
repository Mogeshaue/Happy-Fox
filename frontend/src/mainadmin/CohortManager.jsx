import React, { useEffect, useState } from "react";
import useCourseStore from "../store/Adminstors";

const CohortManager = () => {
  const {
    cohorts,
    fetchCohorts,
    addCohort,
    deleteCohort,
    loadingCohorts,
    errorCohorts,
    courses,
    fetchCourses,
    loadingCourses,
    errorCourses,
  } = useCourseStore();

  const [form, setForm] = useState({ name: "", course: "", start_date: "", end_date: "" });
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCohorts();
    fetchCourses();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.course || !form.start_date || !form.end_date) return;
    setAdding(true);
    await addCohort(form.name, form.course, form.start_date, form.end_date);
    setAdding(false);
    setForm({ name: "", course: "", start_date: "", end_date: "" });
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await deleteCohort(id);
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen p-6 bg-white text-black">
      <h2 className="text-3xl font-bold mb-6">Cohort Management</h2>

      {/* Add Cohort Form */}
      <div className="bg-gray-100 p-5 rounded shadow-sm border border-gray-300 mb-8">
        <h3 className="text-xl font-semibold mb-4">Add New Cohort</h3>
        <form className="flex flex-col md:flex-row gap-4" onSubmit={handleAdd}>
          <input
            type="text"
            name="name"
            placeholder="Cohort Name"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-full bg-white"
            required
          />
          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-full bg-white"
            required
            disabled={loadingCourses}
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-full bg-white"
            required
          />
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-full bg-white"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-800 transition"
            disabled={adding || loadingCourses}
          >
            {adding ? "Adding..." : "Add Cohort"}
          </button>
        </form>
        {errorCohorts && <p className="text-red-500 mt-2">{errorCohorts}</p>}
        {errorCourses && <p className="text-red-500 mt-2">{errorCourses}</p>}
      </div>

      {/* Cohort List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Cohort List</h3>
        {loadingCohorts ? (
          <p className="text-gray-500">Loading cohorts...</p>
        ) : errorCohorts ? (
          <p className="text-red-500">Error: {errorCohorts}</p>
        ) : cohorts.length === 0 ? (
          <p className="text-gray-500">No cohorts added yet.</p>
        ) : (
          <ul className="space-y-3">
            {cohorts.map((cohort) => (
              <li
                key={cohort.id}
                className="bg-gray-100 border border-gray-300 p-4 rounded shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{cohort.name}</p>
                  <p className="text-sm text-gray-600">
                    Course: {courses.find((c) => c.id === cohort.course)?.name || cohort.course}
                  </p>
                  <p className="text-sm text-gray-600">
                    {cohort.start_date} to {cohort.end_date}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(cohort.id)}
                  className="text-red-500 hover:underline text-sm"
                  disabled={deletingId === cohort.id}
                >
                  {deletingId === cohort.id ? "Deleting..." : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CohortManager; 