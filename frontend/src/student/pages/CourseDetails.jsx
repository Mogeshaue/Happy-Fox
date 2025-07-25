import React from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, Play, FileText } from 'lucide-react';

const CourseDetails = () => {
  const { courseId } = useParams();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Course Details</h1>
        <p className="text-gray-600 mt-2">Course ID: {courseId}</p>
      </div>

      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Course content loading...</h3>
        <p className="text-gray-500 mb-6">Course details and materials will be displayed here</p>
      </div>
    </div>
  );
};

export default CourseDetails;
