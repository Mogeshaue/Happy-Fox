import React, { useState } from "react";
import useCourseStore from "../store/Adminstors";

const AdminMentor = () => {
  const { mentors, addMentor, removeMentor } = useCourseStore();
  const [mentorData, setMentorData] = useState({ name: "", email: "" });

  const handleChange = (e) => {
    setMentorData({ ...mentorData, [e.target.name]: e.target.value });
  };

  const handleAddMentor = () => {
    if (mentorData.name.trim() && mentorData.email.trim()) {
      addMentor(mentorData);
      toast.success("Mentor added successfully");
      setMentorData({ name: "", email: "" });
    }
  };

  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-4xl mx-auto bg-gray-100 shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Mentor</h2>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            name="name"
            placeholder="Mentor Name"
            value={mentorData.name}
            onChange={handleChange}
            className="border border-gray-400 px-4 py-2 rounded w-full"
          />
          <input
            type="email"
            name="email"
            placeholder="Mentor Email"
            value={mentorData.email}
            onChange={handleChange}
            className="border border-gray-400 px-4 py-2 rounded w-full"
          />
          <button
            onClick={handleAddMentor}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Add
          </button>
        </div>
      </div>


        <h3 className="text-xl font-semibold mb-3 text-gray-700">Mentor List</h3>
        {mentors.length === 0 ? (
          <p className="text-gray-500">No mentors added yet.</p>
        ) : (
          <ul className="space-y-3">
            {mentors.map((mentor) => (
              <li
                key={mentor.id}
                className="flex justify-between items-center bg-gray-100 border border-gray-300 p-3 rounded"
              >
                <div>
                  <p className="font-medium">{mentor.name}</p>
                  <p className="text-sm text-gray-600">{mentor.email}</p>
                </div>
                <button
                  onClick={() => removeMentor(mentor.id)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
};

export default AdminMentor;
