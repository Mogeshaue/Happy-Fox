import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Assuming the Google Auth user info is saved in localStorage after login
    const storedUser = localStorage.getItem('googleUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Student Profile</h1>

      <div className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-6">
        <img
          src={user.picture}
          alt="Profile"
          className="w-24 h-24 rounded-full border"
        />
        <div>
          <p className="text-xl font-semibold text-gray-800">{user.name}</p>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
