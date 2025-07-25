import React from 'react';
import { Trophy, Award } from 'lucide-react';

const Achievements = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
        <p className="text-gray-600 mt-2">Your badges, milestones, and accomplishments</p>
      </div>

      <div className="text-center py-12">
        <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
        <p className="text-gray-500 mb-6">Start learning to unlock achievements and badges</p>
      </div>
    </div>
  );
};

export default Achievements;
