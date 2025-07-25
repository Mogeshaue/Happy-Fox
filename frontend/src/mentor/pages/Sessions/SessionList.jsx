import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Filter, 
  Plus,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Video,
  MapPin
} from 'lucide-react';

import LoadingSpinner, { CardSpinner } from '../../components/common/LoadingSpinner.jsx';
import MentorBreadcrumb from '../../layout/MentorBreadcrumb.jsx';
import { COLORS, SESSION_STATUS } from '../../utils/constants.js';

// ===================================
// MOCK DATA (Replace with API calls)
// ===================================
const MOCK_SESSIONS = [
  {
    id: 1,
    title: 'React Fundamentals Review',
    description: 'Deep dive into React hooks and state management',
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
      cohort: { name: 'Web Development Bootcamp 2024' }
    },
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-15T10:00:00Z'
  },
  {
    id: 2,
    title: 'Node.js Project Discussion',
    description: 'Review REST API implementation and database design',
    scheduled_at: '2024-12-21T10:00:00Z',
    duration_minutes: 90,
    status: 'scheduled',
    type: 'video_call',
    location: 'https://zoom.us/j/123456789',
    assignment: {
      id: 2,
      student: {
        id: 2,
        full_name: 'Bob Smith',
        email: 'bob.smith@example.com',
        default_dp_color: '#f59e0b'
      },
      cohort: { name: 'Full Stack Development' }
    },
    created_at: '2024-12-16T09:00:00Z',
    updated_at: '2024-12-16T09:00:00Z'
  },
  {
    id: 3,
    title: 'Python Data Analysis Session',
    description: 'Working with pandas and matplotlib for data visualization',
    scheduled_at: '2024-12-18T15:30:00Z',
    duration_minutes: 75,
    status: 'completed',
    type: 'video_call',
    location: 'https://meet.google.com/xyz-abcd-efg',
    assignment: {
      id: 5,
      student: {
        id: 5,
        full_name: 'Eve Davis',
        email: 'eve.davis@example.com',
        default_dp_color: '#8b5cf6'
      },
      cohort: { name: 'Data Science Bootcamp' }
    },
    completed_at: '2024-12-18T16:45:00Z',
    notes: 'Great session! Student showed excellent understanding of data manipulation concepts.',
    created_at: '2024-12-12T11:00:00Z',
    updated_at: '2024-12-18T16:45:00Z'
  },
  {
    id: 4,
    title: 'Career Guidance Session',
    description: 'Discussing career paths and job search strategies',
    scheduled_at: '2024-12-19T13:00:00Z',
    duration_minutes: 45,
    status: 'cancelled',
    type: 'video_call',
    location: 'https://teams.microsoft.com/l/meetup-join/...',
    assignment: {
      id: 3,
      student: {
        id: 3,
        full_name: 'Charlie Brown',
        email: 'charlie.brown@example.com',
        default_dp_color: '#6366f1'
      },
      cohort: { name: 'Web Development Bootcamp 2024' }
    },
    cancelled_at: '2024-12-18T10:00:00Z',
    cancellation_reason: 'Student had an emergency',
    created_at: '2024-12-10T14:00:00Z',
    updated_at: '2024-12-18T10:00:00Z'
  },
  {
    id: 5,
    title: 'Code Review: E-commerce Project',
    description: 'Reviewing student\'s capstone project implementation',
    scheduled_at: '2024-12-22T16:00:00Z',
    duration_minutes: 120,
    status: 'in_progress',
    type: 'video_call',
    location: 'https://meet.google.com/def-ghi-jkl',
    assignment: {
      id: 4,
      student: {
        id: 4,
        full_name: 'Diana Prince',
        email: 'diana.prince@example.com',
        default_dp_color: '#ec4899'
      },
      cohort: { name: 'Mobile Development Bootcamp' }
    },
    started_at: '2024-12-22T16:00:00Z',
    created_at: '2024-12-14T12:00:00Z',
    updated_at: '2024-12-22T16:00:00Z'
  }
];

/**
 * SessionList - Component for displaying and managing mentor sessions
 * 
 * This component provides:
 * - List of scheduled, completed, and cancelled sessions
 * - Search and filtering functionality
 * - Session status management
 * - Navigation to session details
 * - Quick actions for session management
 * 
 * @returns {JSX.Element} The session list page
 */
const SessionList = () => {
  // ===================================
  // STATE MANAGEMENT
  // ===================================
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local component state
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter and display state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || 'all');

  // ===================================
  // API INTEGRATION (Currently using mock data)
  // TODO: Replace mock data with actual API calls
  // ===================================

  /**
   * Fetches session data from the backend API
   * Currently uses mock data - replace with actual API call
   */
  const fetchSessions = async (filters = {}) => {
    try {
      setError(null);
      setLoading(true);
      // Replace with your real backend endpoint for mentor sessions
      // Example: /mentor/api/sessions/ or similar
      const queryParams = new URLSearchParams({
        ...filters
      });
      const response = await fetch(`http://127.0.0.1:8000/mentor/api/sessions/?${queryParams}`, {
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
      if (Array.isArray(data)) {
        setSessions(data);
      } else if (data.results) {
        setSessions(data.results);
      } else if (data.data) {
        setSessions(data.data);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error('Sessions fetch error:', err);
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Updates session status via API
   * Currently uses mock data - replace with actual API call
   */
  const updateSessionStatus = async (sessionId, newStatus) => {
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
        // Update local state
        setSessions(prev => prev.map(session => 
          session.id === sessionId 
            ? { ...session, status: newStatus, updated_at: new Date().toISOString() }
            : session
        ));
      } else {
        throw new Error(data.message || 'Failed to update session status');
      }
      */

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update mock data
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: newStatus, updated_at: new Date().toISOString() }
          : session
      ));
      
      console.log(`Session ${sessionId} status updated to ${newStatus}`);
      
    } catch (err) {
      console.error('Session update error:', err);
      setError(err.message || 'Failed to update session status');
    }
  };

  /**
   * Refreshes sessions data
   * Provides user feedback during refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
  };

  /**
   * Handles search form submission
   * Updates URL parameters to maintain state
   */
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => {
      if (searchQuery.trim()) {
        prev.set('search', searchQuery.trim());
      } else {
        prev.delete('search');
      }
      return prev;
    });
  };

  /**
   * Handles status filter changes
   * @param {string} status - The selected status filter
   */
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setSearchParams(prev => {
      if (status !== 'all') {
        prev.set('status', status);
      } else {
        prev.delete('status');
      }
      return prev;
    });
  };

  /**
   * Handles date filter changes
   * @param {string} dateRange - The selected date range filter
   */
  const handleDateFilter = (dateRange) => {
    setDateFilter(dateRange);
    setSearchParams(prev => {
      if (dateRange !== 'all') {
        prev.set('date', dateRange);
      } else {
        prev.delete('date');
      }
      return prev;
    });
  };

  /**
   * Gets the appropriate status color for a session
   * @param {string} status - The session status
   * @returns {string} The color class or hex color
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

  /**
   * Gets the appropriate status icon for a session
   * @param {string} status - The session status
   * @returns {JSX.Element} The status icon
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Calendar size={16} />;
      case 'in_progress':
        return <Play size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  /**
   * Clears the search query and updates URL
   */
  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams(prev => {
      prev.delete('search');
      return prev;
    });
  };

  // ===================================
  // DATA PROCESSING & FILTERING
  // ===================================

  /**
   * Filters sessions based on current criteria
   * Uses useMemo for performance optimization
   */
  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(session => {
      // Search filter - check title, student name, description
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        session.title?.toLowerCase().includes(searchLower) ||
        session.assignment?.student?.full_name?.toLowerCase().includes(searchLower) ||
        session.description?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;

      // Date filter
      const sessionDate = new Date(session.scheduled_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      let matchesDate = true;
      switch (dateFilter) {
        case 'today':
          matchesDate = sessionDate >= today && sessionDate < tomorrow;
          break;
        case 'tomorrow':
          matchesDate = sessionDate >= tomorrow && sessionDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'this_week':
          matchesDate = sessionDate >= today && sessionDate <= weekFromNow;
          break;
        case 'past':
          matchesDate = sessionDate < today;
          break;
        default:
          matchesDate = true;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort by scheduled date (newest first)
    filtered.sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));

    return filtered;
  }, [sessions, searchQuery, statusFilter, dateFilter]);

  /**
   * Generates status filter options with counts
   */
  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Sessions', count: sessions.length },
    { value: 'scheduled', label: 'Scheduled', count: sessions.filter(s => s.status === 'scheduled').length },
    { value: 'in_progress', label: 'In Progress', count: sessions.filter(s => s.status === 'in_progress').length },
    { value: 'completed', label: 'Completed', count: sessions.filter(s => s.status === 'completed').length },
    { value: 'cancelled', label: 'Cancelled', count: sessions.filter(s => s.status === 'cancelled').length },
  ], [sessions]);

  /**
   * Generates date filter options
   */
  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'this_week', label: 'This Week' },
    { value: 'past', label: 'Past Sessions' },
  ];

  // ===================================
  // COMPONENT LIFECYCLE
  // ===================================
  useEffect(() => {
    fetchSessions();
  }, []);

  // ===================================
  // ERROR HANDLING & LOADING STATES
  // ===================================
  
  // Show loading spinner while fetching data
  if (loading && sessions.length === 0) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <CardSpinner text="Loading sessions..." />
      </div>
    );
  }

  // Show error state with retry option
  if (error && sessions.length === 0) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Sessions</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSessions}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-600">
            Manage your mentoring sessions and schedule new ones.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh sessions"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => navigate('/mentor/sessions/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search Section */}
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search sessions, students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
          </div>

          {/* Controls Section */}
          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-500" />
              <select
                value={dateFilter}
                onChange={(e) => handleDateFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {dateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredSessions.length} of {sessions.length} sessions
        </span>
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Sessions List */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/mentor/sessions/${session.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {session.title}
                    </h3>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                      style={{
                        backgroundColor: `${getStatusColor(session.status)}20`,
                        color: getStatusColor(session.status)
                      }}
                    >
                      {getStatusIcon(session.status)}
                      <span className="ml-1">{session.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{session.description}</p>

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users size={16} />
                      <span>{session.assignment?.student?.full_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>
                        {new Date(session.scheduled_at).toLocaleDateString()} at{' '}
                        {new Date(session.scheduled_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{session.duration_minutes} min</span>
                    </div>
                    {session.type === 'video_call' && (
                      <div className="flex items-center space-x-1">
                        <Video size={16} />
                        <span>Video Call</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {session.status === 'scheduled' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSessionStatus(session.id, 'in_progress');
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Start session"
                      >
                        <Play size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSessionStatus(session.id, 'cancelled');
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel session"
                      >
                        <Pause size={16} />
                      </button>
                    </>
                  )}
                  {session.status === 'in_progress' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSessionStatus(session.id, 'completed');
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Complete session"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  {session.location && (
                    <a
                      href={session.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Join session"
                    >
                      <MapPin size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No sessions found' : 'No sessions scheduled'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? 'Try adjusting your search criteria or filters.'
              : 'Schedule your first mentoring session with a student.'
            }
          </p>
          {!searchQuery ? (
            <button
              onClick={() => navigate('/mentor/sessions/new')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule Session
            </button>
          ) : (
            <button
              onClick={clearSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Refresh Loading Overlay */}
      {refreshing && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <LoadingSpinner text="Refreshing sessions..." />
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionList; 