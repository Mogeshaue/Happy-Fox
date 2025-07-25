import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Users, Award } from 'lucide-react';
import StudentAPI from '../services/StudentAPI';
import LoadingSpinner from '../components/LoadingSpinner';

const StudentCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await StudentAPI.getEnrollments();
      setEnrollments(data.results || []);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your courses..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-2">Track your learning progress and continue your studies</p>
      </div>

      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    enrollment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {enrollment.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {enrollment.course?.name || 'Course Name'}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {enrollment.course?.description || 'Course description'}
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{enrollment.progress_percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${enrollment.progress_percentage || 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                    </div>
                    {enrollment.grade && (
                      <div className="flex items-center space-x-1">
                        <Award size={14} />
                        <span>Grade: {enrollment.grade}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet. Start your learning journey!</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Browse Available Courses
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
