import React from 'react';
import { Users, Plus, Search } from 'lucide-react';

const StudyGroups = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
          <p className="text-gray-600 mt-2">Connect with peers and learn together</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus size={16} />
          <span>Create Group</span>
        </button>
      </div>

      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No study groups yet</h3>
        <p className="text-gray-500 mb-6">Join or create study groups to collaborate with other students</p>
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Search size={16} />
            <span>Find Groups</span>
          </button>
          <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Plus size={16} />
            <span>Create Group</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyGroups;
