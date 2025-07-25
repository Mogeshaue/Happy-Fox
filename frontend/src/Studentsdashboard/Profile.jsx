import React from 'react';
import useCourseStore from '../store/Adminstors';

const Profile = () => {
  const { authUser, storementors } = useCourseStore();

  if (!authUser) {
    return <div className="text-center text-gray-500 mt-10">No user data available.</div>;
  }

  const {
    first_name,
    last_name,
    email,
    created_at,
    default_dp_color,
  } = authUser;

  const fullName = `${first_name} ${last_name}`;
  const joinDate = new Date(created_at).toLocaleDateString();
  const isMentor = storementors.includes(email);
  const role = isMentor ? 'Mentor' : 'Student';

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
          style={{ backgroundColor: default_dp_color || '#333' }}
        >
          {first_name[0]}
        </div>

        {/* Info */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">{fullName}</h2>
          <p className="text-gray-600">{email}</p>
          <p className="text-sm text-gray-500 mt-1">Joined on: {joinDate}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
            Role: {role}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
