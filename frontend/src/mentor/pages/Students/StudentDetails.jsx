import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen,
  TrendingUp,
  MessageSquare,
  Clock,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Plus
} from 'lucide-react';

import LoadingSpinner, { CardSpinner } from '../../components/common/LoadingSpinner.jsx';
import MentorBreadcrumb from '../../layout/MentorBreadcrumb.jsx';
import { COLORS } from '../../utils/constants.js';

// ===================================
// MOCK DATA (Replace with API calls)
// ===================================
const MOCK_STUDENT_DETAILS = {
  id: 1,
  student: {
    id: 1,
    email: 'alice.johnson@example.com',
    first_name: 'Alice',
    last_name: 'Johnson',
    full_name: 'Alice Johnson',
    default_dp_color: '#10b981'
  },
  cohort: { name: 'Web Development Bootcamp 2024' },
  course: { name: 'Full Stack JavaScript' },
  status: 'active',
  assigned_at: '2024-01-15T10:00:00Z',
  started_at: '2024-01-20T09:00:00Z',
  progress_percentage: 65,
  last_session_at: '2024-12-15T14:00:00Z',
  total_sessions: 12,
  completed_sessions: 8,
  upcoming_sessions: 2
};

/**
 * StudentDetails - Component for viewing detailed student information
 * 
 * This component provides:
 * - Detailed student profile information
 * - Progress tracking and metrics
 * - Session history and upcoming sessions
 * - Quick actions for student management
 * 
 * @returns {JSX.Element} The student details page
 */
const StudentDetails = () => {
  // ===================================
  // STATE MANAGEMENT
  // ===================================
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Local component state
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===================================
  // API INTEGRATION (Currently using mock data)
  // TODO: Replace mock data with actual API calls
  // ===================================

  /**
   * Fetches student details from the backend API
   * Currently uses mock data - replace with actual API call
   */
  const fetchStudentDetails = async () => {
    try {
      setError(null);
      
      // MOCK DATA USAGE
      // TODO: Replace this with actual API call
      // Example API call (commented out):
      /*
      const response = await fetch(`http://127.0.0.1:8000/mentor/api/assignments/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Add if authentication is needed
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStudentData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch student details');
      }
      */

      // Simulate API delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Use mock data for now
      setStudentData(MOCK_STUDENT_DETAILS);
      
    } catch (err) {
      console.error('Student fetch error:', err);
      setError(err.message || 'Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // COMPONENT LIFECYCLE
  // ===================================
  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  // ===================================
  // ERROR HANDLING & LOADING STATES
  // ===================================
  
  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <CardSpinner text="Loading student details..." />
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Student</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStudentDetails}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-4">The student you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/mentor/students')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  // ===================================
  // RENDER COMPONENT
  // ===================================
  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <MentorBreadcrumb />

      {/* Header Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/mentor/students')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to students"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {studentData.student?.full_name}
          </h1>
          <p className="text-gray-600">
            Student in {studentData.cohort?.name}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/mentor/sessions/new?student=${studentData.student?.id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Schedule Session</span>
          </button>
          <button
            onClick={() => navigate(`/mentor/messages/new?student=${studentData.student?.id}`)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <MessageSquare size={16} />
            <span>Send Message</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Student Info & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Profile */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Profile</h2>
            
            <div className="flex items-center space-x-4 mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: studentData.student?.default_dp_color || COLORS.PRIMARY }}
              >
                {studentData.student?.first_name?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {studentData.student?.full_name}
                </h3>
                <p className="text-gray-500 flex items-center space-x-1">
                  <Mail size={16} />
                  <span>{studentData.student?.email}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cohort</label>
                <div className="flex items-center space-x-2">
                  <BookOpen size={16} className="text-gray-500" />
                  <span className="text-gray-900">{studentData.cohort?.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <div className="flex items-center space-x-2">
                  <BookOpen size={16} className="text-gray-500" />
                  <span className="text-gray-900">{studentData.course?.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Status</label>
                <span 
                  className="inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize"
                  style={{
                    backgroundColor: studentData.status === 'active' ? '#dcfce7' : '#fef3c7',
                    color: studentData.status === 'active' ? '#166534' : '#a16207'
                  }}
                >
                  {studentData.status}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-gray-900">
                    {new Date(studentData.assigned_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {studentData.progress_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${studentData.progress_percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {studentData.completed_sessions}
                  </div>
                  <div className="text-sm text-gray-600">Completed Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {studentData.upcoming_sessions}
                  </div>
                  <div className="text-sm text-gray-600">Upcoming Sessions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Clock size={16} className="text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Last session completed
                  </p>
                  <p className="text-xs text-gray-500">
                    {studentData.last_session_at 
                      ? new Date(studentData.last_session_at).toLocaleDateString()
                      : 'No sessions yet'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <TrendingUp size={16} className="text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Progress updated
                  </p>
                  <p className="text-xs text-gray-500">
                    Current progress: {studentData.progress_percentage}%
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <User size={16} className="text-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Assignment started
                  </p>
                  <p className="text-xs text-gray-500">
                    {studentData.started_at 
                      ? new Date(studentData.started_at).toLocaleDateString()
                      : 'Not started yet'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Session Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Sessions</span>
                <span className="font-semibold text-gray-900">
                  {studentData.total_sessions || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">
                  {studentData.completed_sessions || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Upcoming</span>
                <span className="font-semibold text-blue-600">
                  {studentData.upcoming_sessions || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold text-gray-900">
                  {studentData.total_sessions > 0 
                    ? Math.round((studentData.completed_sessions / studentData.total_sessions) * 100)
                    : 0
                  }%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/mentor/sessions/new?student=${studentData.student?.id}`)}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Schedule Session</p>
                  <p className="text-xs text-gray-500">Book a new mentoring session</p>
                </div>
              </button>

              <button
                onClick={() => navigate(`/mentor/messages/new?student=${studentData.student?.id}`)}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Send Message</p>
                  <p className="text-xs text-gray-500">Send a direct message</p>
                </div>
              </button>

              <button
                onClick={() => navigate(`/mentor/sessions?student=${studentData.student?.id}`)}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">View Sessions</p>
                  <p className="text-xs text-gray-500">See all session history</p>
                </div>
              </button>
            </div>
          </div>

          {/* Assignment Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Timeline</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Assigned:</span>
                <span className="text-gray-900">
                  {new Date(studentData.assigned_at).toLocaleDateString()}
                </span>
              </div>
              
              {studentData.started_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="text-gray-900">
                    {new Date(studentData.started_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="capitalize text-gray-900">
                  {studentData.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails; 