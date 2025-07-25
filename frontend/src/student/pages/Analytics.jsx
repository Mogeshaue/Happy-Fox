import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Learning Analytics</h1>
        <p className="text-gray-600 mt-2">Track your progress and performance insights</p>
      </div>

      <div className="text-center py-12">
        <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics coming soon</h3>
        <p className="text-gray-500 mb-6">Detailed learning analytics will be available here</p>
      </div>
    </div>
  );
};

export default Analytics;
