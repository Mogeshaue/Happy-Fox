import React from 'react';
import { Library, BookmarkPlus } from 'lucide-react';

const LearningResources = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Resources</h1>
          <p className="text-gray-600 mt-2">Access and organize your study materials</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <BookmarkPlus size={16} />
          <span>Add Resource</span>
        </button>
      </div>

      <div className="text-center py-12">
        <Library className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No resources saved</h3>
        <p className="text-gray-500 mb-6">Save and organize your learning materials here</p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <BookmarkPlus size={16} />
          <span>Add Your First Resource</span>
        </button>
      </div>
    </div>
  );
};

export default LearningResources;
