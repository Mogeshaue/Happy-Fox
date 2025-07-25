import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video,
  FileText,
  Edit3,
  Play,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  MapPin
} from 'lucide-react';

import LoadingSpinner, { CardSpinner } from '../../components/common/LoadingSpinner.jsx';
import MentorBreadcrumb from '../../layout/MentorBreadcrumb.jsx';
import { COLORS } from '../../utils/constants.js';

// ===================================
// MOCK DATA (Replace with API calls)
// ===================================
const MOCK_SESSION_DETAILS = {
  id: 1,
  title: 'React Fundamentals Review',
  description: 'Deep dive into React hooks and state management concepts. We will cover useState, useEffect, custom hooks, and best practices for component optimization.',
  scheduled_at: '2024-12-20T14:00:00Z',
  duration_minutes: 60,
  status: 'scheduled',
  type: 'video_call',
  location: 'https://meet.google.com/abc-defg-hij',
  assignment: {
    id: 1,
    student: {
      id: 1,
      full_name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      default_dp_color: '#10b981'
    },
    cohort: { name: 'Web Development Bootcamp 2024' },
    course: { name: 'Full Stack JavaScript' }
  },
  notes: 'Student has been struggling with useEffect dependencies. Focus on practical examples.',
  objectives: [
    'Review React hooks fundamentals',
    'Practice building custom hooks',
    'Discuss component optimization techniques',
    'Code review of student\'s recent project'
  ],
  materials: [
    { name: 'React Hooks Cheatsheet', url: 'https://example.com/react-hooks' },
    { name: 'Student Project Repository', url: 'https://github.com/student/project' }
  ],
  created_at: '2024-12-15T10:00:00Z',
  updated_at: '2024-12-15T10:00:00Z'
};

/**
 * SessionDetails - Component for viewing and managing individual session details
 * 
 * This component provides:
 * - Detailed view of session information
 * - Session status management
 * - Notes and objectives editing
 * - Quick actions for session control
 * 
 * @returns {JSX.Element} The session details page
 */
const SessionDetails = () => {
  // ===================================
  // STATE MANAGEMENT
  // ===================================
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  // Local component state
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');

  // ===================================
  // API INTEGRATION (Currently using mock data)
  // TODO: Replace mock data with actual API calls
  // ===================================

  /**
   * Fetches session details from the backend API
   * Currently uses mock data - replace with actual API call
   */
  const fetchSessionDetails = async () => {
    try {
      setError(null);
      setLoading(true);
      // Replace with your real backend endpoint for mentor session details
      // Example: /mentor/api/sessions/:id/ or similar
      const response = await fetch(`http://127.0.0.1:8000/mentor/api/sessions/${sessionId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Adjust this according to your backend response structure
      if (data.data) {
        setSession(data.data);
        setNotes(data.data.notes || '');
      } else if (data.results) {
        setSession(data.results);
        setNotes(data.results.notes || '');
      } else if (Array.isArray(data)) {
        setSession(data);
        setNotes('');
      } else {
        setSession(null);
        setNotes('');
      }
    } catch (err) {
      console.error('Session fetch error:', err);
      setError(err.message || 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates session status via API
   * Currently uses mock data - replace with actual API call
   */
  const updateSessionStatus = async (newStatus) => {
    try {
      // MOCK DATA USAGE
      // TODO: Replace this with actual API call
      // Example API call (commented out):
      /*
      const response = await fetch(`http://127.0.0.1:8000/mentor/api/sessions/${sessionId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Add if authentication is needed
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSession(prev => ({ ...prev, status: newStatus, updated_at: new Date().toISOString() }));
      } else {
        throw new Error(data.message || 'Failed to update session status');
      }
      */

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update mock data
      setSession(prev => ({ ...prev, status: newStatus, updated_at: new Date().toISOString() }));
      
      console.log(`Session ${sessionId} status updated to ${newStatus}`);
      
    } catch (err) {
      console.error('Session update error:', err);
      setError(err.message || 'Failed to update session status');
    }
  };

  /**
   * Saves session notes via API
   * Currently uses mock data - replace with actual API call
   */
  const saveNotes = async () => {
    try {
      // MOCK DATA USAGE
      // TODO: Replace this with actual API call
      // Example API call (commented out):
      /*
      const response = await fetch(`http://127.0.0.1:8000/mentor/api/sessions/${sessionId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Add if authentication is needed
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSession(prev => ({ ...prev, notes, updated_at: new Date().toISOString() }));
        setIsEditing(false);
      } else {
        throw new Error(data.message || 'Failed to save notes');
      }
      */

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update mock data
      setSession(prev => ({ ...prev, notes, updated_at: new Date().toISOString() }));
      setIsEditing(false);
      
      console.log('Session notes saved successfully');
      
    } catch (err) {
      console.error('Notes save error:', err);
      setError(err.message || 'Failed to save notes');
    }
  };

  /**
   * Gets the appropriate status color for the session
   * @param {string} status - The session status
   * @returns {string} The color hex code
   */
  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#3b82f6',
      in_progress: '#10b981',
      completed: '#22c55e',
      cancelled: '#ef4444',
      rescheduled: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  // ===================================
  // COMPONENT LIFECYCLE
  // ===================================
  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  // ===================================
  // ERROR HANDLING & LOADING STATES
  // ===================================
  
  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <CardSpinner text="Loading session details..." />
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Session</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSessionDetails}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-4">The session you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/mentor/sessions')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Sessions
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
          onClick={() => navigate('/mentor/sessions')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to sessions"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize"
              style={{
                backgroundColor: `${getStatusColor(session.status)}20`,
                color: getStatusColor(session.status)
              }}
            >
              {session.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-gray-600">
            Session with {session.assignment?.student?.full_name}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {session.status === 'scheduled' && (
            <>
              <button
                onClick={() => updateSessionStatus('in_progress')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Play size={16} />
                <span>Start Session</span>
              </button>
              <button
                onClick={() => updateSessionStatus('cancelled')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
          {session.status === 'in_progress' && (
            <button
              onClick={() => updateSessionStatus('completed')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle size={16} />
              <span>Complete Session</span>
            </button>
          )}
          {session.meeting_link && (
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <Video size={16} />
              <span>Join Call</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Session Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900">{session.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <Calendar size={16} />
                    <span>
                      {new Date(session.scheduled_at).toLocaleDateString()} at{' '}
                      {new Date(session.scheduled_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <Clock size={16} />
                    <span>{session.duration_minutes} minutes</span>
                  </div>
                </div>
              </div>

              {session.meeting_link && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Location</label>
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-gray-500" />
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      {session.meeting_link}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Session Objectives */}
          {session.objectives && session.objectives.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Objectives</h2>
              <ul className="space-y-2">
                {session.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Session Materials */}
          {session.materials && session.materials.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Materials</h2>
              <div className="space-y-2">
                {session.materials.map((material, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <FileText size={16} className="text-gray-500" />
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      {material.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Session Notes</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-sm"
                >
                  <Edit3 size={16} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add notes about this session..."
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={saveNotes}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={() => {
                      setNotes(session.notes || '');
                      setIsEditing(false);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {session.notes ? (
                  <p className="text-gray-900 whitespace-pre-wrap">{session.notes}</p>
                ) : (
                  <p className="text-gray-500 italic">No notes added yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Student Info & Quick Actions */}
        <div className="space-y-6">
          {/* Student Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: session.assignment?.student?.default_dp_color || COLORS.PRIMARY }}
                >
                  {session.assignment?.student?.full_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {session.assignment?.student?.full_name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {session.assignment?.student?.email}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Cohort:</span>
                    <span className="ml-2 text-gray-900">{session.assignment?.cohort?.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Course:</span>
                    <span className="ml-2 text-gray-900">{session.assignment?.course?.name}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/mentor/students/${session.assignment?.student?.id}`)}
                className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                View Student Profile
              </button>
            </div>
          </div>

          {/* Session Metadata */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">
                  {new Date(session.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-900">
                  {new Date(session.updated_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Session Type:</span>
                <span className="text-gray-900 capitalize">
                  {session.type?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails; 