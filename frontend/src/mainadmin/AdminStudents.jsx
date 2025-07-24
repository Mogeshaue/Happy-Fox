import React, { useState } from 'react';
import useCourseStore from '../store/Adminstors';


const AdminStudents = () => {
  const { students, addStudent, removeStudent } = useCourseStore();
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
    addStudent(formData);
    toast.success("Student added successfully");
    setFormData({ name: '', email: '' });
  };

  return (
    <div className="min-h-screen p-6 bg-white text-black">
      <h2 className="text-3xl font-bold mb-6">Student Management</h2>

      {/* Add Student Form */}
      <div className="bg-gray-100 p-5 rounded shadow-sm border border-gray-300 mb-8">
        <h3 className="text-xl font-semibold mb-4">Add New Student</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Student Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border border-gray-300 rounded px-4 py-2 w-full bg-white"
          />
          <input
            type="email"
            placeholder="Student Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="border border-gray-300 rounded px-4 py-2 w-full bg-white"
          />
          <button
            onClick={handleAdd}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-800 transition"
          >
            Add
          </button>
        </div>
      </div>

      {/* Student List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Student List</h3>
        {students.length === 0 ? (
          <p className="text-gray-500">No students added yet.</p>
        ) : (
          <ul className="space-y-3">
            {students.map((student) => (
              <li
                key={student.id}
                className="bg-gray-100 border border-gray-300 p-4 rounded shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
                <button
                  onClick={() => removeStudent(student.id)}
                  className="text-red-500 hover:underline text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;
