import React from 'react';
import { Target, Plus } from 'lucide-react';

const LearningGoals = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Goals</h1>
          <p className="text-gray-600 mt-2">Set and track your learning objectives</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus size={16} />
          <span>New Goal</span>
        </button>
      </div>

      <div className="text-center py-12">
        <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No learning goals set</h3>
        <p className="text-gray-500 mb-6">Set specific goals to track your learning progress</p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus size={16} />
          <span>Create Your First Goal</span>
        </button>
      </div>
    </div>
  );
};

export default LearningGoals;
