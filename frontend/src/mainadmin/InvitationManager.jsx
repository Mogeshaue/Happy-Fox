import React, { useEffect, useState } from "react";
import useCourseStore from "../store/Adminstors";

const InvitationManager = () => {
  const {
    invitations,
    fetchInvitations,
    addInvitation,
    deleteInvitation,
    loadingInvitations,
    errorInvitations,
    teams,
    fetchTeams,
    loadingTeams,
    errorTeams,
  } = useCourseStore();

  const [form, setForm] = useState({ email: "", team: "" });
  const [inviting, setInviting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchInvitations();
    fetchTeams();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!form.email || !form.team) return;
    setInviting(true);
    await addInvitation(form.email, form.team);
    setInviting(false);
    setForm({ email: "", team: "" });
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await deleteInvitation(id);
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen p-6 bg-white text-black">
      <h2 className="text-3xl font-bold mb-6">Invitation Management</h2>

      {/* Invite Member Form */}
      <div className="bg-gray-100 p-5 rounded shadow-sm border border-gray-300 mb-8">
        <h3 className="text-xl font-semibold mb-4">Invite Member to Team</h3>
        <form className="flex flex-col md:flex-row gap-4" onSubmit={handleInvite}>
          <input
            type="email"
            name="email"
            placeholder="Member Email"
            value={form.email}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-full bg-white"
            required
          />
          <select
            name="team"
            value={form.team}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-full bg-white"
            required
            disabled={loadingTeams}
          >
            <option value="">Select Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-800 transition"
            disabled={inviting || loadingTeams}
          >
            {inviting ? "Inviting..." : "Invite"}
          </button>
        </form>
        {errorInvitations && <p className="text-red-500 mt-2">{errorInvitations}</p>}
        {errorTeams && <p className="text-red-500 mt-2">{errorTeams}</p>}
      </div>

      {/* Invitation List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Invitations</h3>
        {loadingInvitations ? (
          <p className="text-gray-500">Loading invitations...</p>
        ) : errorInvitations ? (
          <p className="text-red-500">Error: {errorInvitations}</p>
        ) : invitations.length === 0 ? (
          <p className="text-gray-500">No invitations sent yet.</p>
        ) : (
          <ul className="space-y-3">
            {invitations.map((inv) => (
              <li
                key={inv.id}
                className="bg-gray-100 border border-gray-300 p-4 rounded shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{inv.email}</p>
                  <p className="text-sm text-gray-600">
                    Team: {teams.find((t) => t.id === inv.team)?.name || inv.team}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {inv.accepted ? "Accepted" : "Pending"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(inv.id)}
                  className="text-red-500 hover:underline text-sm"
                  disabled={deletingId === inv.id}
                >
                  {deletingId === inv.id ? "Revoking..." : "Revoke"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InvitationManager; 