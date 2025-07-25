import React from 'react';
import { FileText, Upload } from 'lucide-react';

const Assignments = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600 mt-2">Submit and track your assignments</p>
      </div>

      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments available</h3>
        <p className="text-gray-500 mb-6">Assignment submissions will appear here</p>
      </div>
    </div>
  );
};

export default Assignments;
