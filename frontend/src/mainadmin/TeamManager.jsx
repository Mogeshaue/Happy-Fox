import React, { useEffect, useState } from "react";
import useCourseStore from "../store/Adminstors";

const TeamManager = () => {
  const {
    teams,
    fetchTeams,
    addTeam,
    deleteTeam,
    loadingTeams,
    errorTeams,
    cohorts,
    fetchCohorts,
    loadingCohorts,
    errorCohorts,
  } = useCourseStore();

  const [form, setForm] = useState({ name: "", cohort: "" });
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTeams();
    fetchCohorts();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.cohort) return;
    setAdding(true);
    await addTeam(form.name, form.cohort);
    setAdding(false);
    setForm({ name: "", cohort: "" });
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await deleteTeam(id);
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen p-6 bg-white text-black">
      <h2 className="text-3xl font-bold mb-6">Team Management</h2>

      {/* Add Team Form */}
      <div className="bg-gray-100 p-5 rounded shadow-sm border border-gray-300 mb-8">
        <h3 className="text-xl font-semibold mb-4">Add New Team</h3>
        <form className="flex flex-col md:flex-row gap-4" onSubmit={handleAdd}>
          <input
            type="text"
            name="name"
            placeholder="Team Name"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-full bg-white"
            required
          />
          <select
            name="cohort"
            value={form.cohort}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-full bg-white"
            required
            disabled={loadingCohorts}
          >
            <option value="">Select Cohort</option>
            {cohorts.map((cohort) => (
              <option key={cohort.id} value={cohort.id}>
                {cohort.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-800 transition"
            disabled={adding || loadingCohorts}
          >
            {adding ? "Adding..." : "Add Team"}
          </button>
        </form>
        {errorTeams && <p className="text-red-500 mt-2">{errorTeams}</p>}
        {errorCohorts && <p className="text-red-500 mt-2">{errorCohorts}</p>}
      </div>

      {/* Team List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Team List</h3>
        {loadingTeams ? (
          <p className="text-gray-500">Loading teams...</p>
        ) : errorTeams ? (
          <p className="text-red-500">Error: {errorTeams}</p>
        ) : teams.length === 0 ? (
          <p className="text-gray-500">No teams added yet.</p>
        ) : (
          <ul className="space-y-3">
            {teams.map((team) => (
              <li
                key={team.id}
                className="bg-gray-100 border border-gray-300 p-4 rounded shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="text-sm text-gray-600">
                    Cohort: {cohorts.find((c) => c.id === team.cohort)?.name || team.cohort}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(team.id)}
                  className="text-red-500 hover:underline text-sm"
                  disabled={deletingId === team.id}
                >
                  {deletingId === team.id ? "Deleting..." : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TeamManager; 