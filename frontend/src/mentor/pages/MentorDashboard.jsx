import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

import StatsCard from '../components/common/StatsCard.jsx';
import StudentCard from '../components/common/StudentCard.jsx';
import LoadingSpinner, { CardSpinner } from '../components/common/LoadingSpinner.jsx';
import MentorBreadcrumb from '../layout/MentorBreadcrumb.jsx';
import { COLORS } from '../utils/constants.js';

// ===================================
// MOCK DATA (Replace with API calls)
// ===================================
const MOCK_DASHBOARD_DATA = {
  mentor_profile: {
    id: 1,
    user: {
      id: 1,
      email: 'mentor@example.com',
      first_name: 'John',
      last_name: 'Doe',
      full_name: 'John Doe',
      default_dp_color: '#2563eb'
    },
    bio: 'Experienced software engineer with 8+ years in full-stack development.',
    experience_level: 'senior',
    status: 'active',
    expertise_areas: ['JavaScript', 'React', 'Node.js', 'Python'],
    max_students: 10,
    current_student_count: 3,
    rating: 4.8,
    total_reviews: 24
  },
  stats: {
    active_students: 3,
    total_students: 8,
    upcoming_sessions: 5,
    unread_messages: 2,
    completed_sessions: 45,
    completion_rate: 92
  },
  active_assignments: [
    {
      id: 1,
      student: {
        id: 1,
        email: 'student1@example.com',
        first_name: 'Alice',
        last_name: 'Johnson',
        full_name: 'Alice Johnson',
        default_dp_color: '#10b981'
      },
      cohort: { id: 1, name: 'Web Development Bootcamp 2024' },
      status: 'active',
      assigned_at: '2024-01-15T10:00:00Z',
      expected_duration_weeks: 12,
      progress_percentage: 65
    },
    {
      id: 2,
      student: {
        id: 2,
        email: 'student2@example.com',
        first_name: 'Bob',
        last_name: 'Smith',
        full_name: 'Bob Smith',
        default_dp_color: '#f59e0b'
      },
      cohort: { id: 1, name: 'Full Stack Development' },
      status: 'active',
      assigned_at: '2024-02-01T09:00:00Z',
      expected_duration_weeks: 16,
      progress_percentage: 30
    }
  ],
  upcoming_sessions: [
    {
      id: 1,
      title: 'React Fundamentals Review',
      scheduled_at: '2024-12-20T14:00:00Z',
      assignment: {
        student: { full_name: 'Alice Johnson' }
      }
    },
    {
      id: 2,
      title: 'Node.js Project Discussion',
      scheduled_at: '2024-12-21T10:00:00Z',
      assignment: {
        student: { full_name: 'Bob Smith' }
      }
    }
  ],
  recent_messages: []
};

/**
 * MentorDashboard - Main dashboard component for mentors
 * 
 * This component displays:
 * - Key metrics and statistics
 * - Active student assignments
 * - Upcoming sessions
 * - Quick action buttons
 * 
 * @returns {JSX.Element} The mentor dashboard
 */
const MentorDashboard = () => {
  // ===================================
  // STATE MANAGEMENT
  // ===================================
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ===================================
  // API INTEGRATION (Currently using mock data)
  // TODO: Replace mock data with actual API calls
  // ===================================
  
  /**
   * Fetches dashboard data from the backend API
   * Currently uses mock data - replace with actual API call
   */
  const fetchDashboardData = async () => {
    try {
      setError(null);
      setLoading(true);
      // Replace with your real backend endpoint for mentor dashboard
      // Example: /mentor/api/dashboard/ or similar
      const response = await fetch('http://127.0.0.1:8000/mentor/api/dashboard/', {
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
        setDashboardData(data.data);
      } else if (data.results) {
        setDashboardData(data.results);
      } else if (Array.isArray(data)) {
        setDashboardData(data);
      } else {
        setDashboardData(null);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Refreshes dashboard data
   * Provides user feedback during refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  /**
   * Handles timeframe changes for dashboard filtering
   * @param {string} timeframe - The selected timeframe (day, week, month, quarter)
   */
  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    // TODO: Refetch data with new timeframe filter
    // fetchDashboardData({ timeframe });
  };

  // ===================================
  // COMPONENT LIFECYCLE
  // ===================================
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ===================================
  // ERROR HANDLING & LOADING STATES
  // ===================================
  
  // Show loading spinner while fetching data
  if (loading && !dashboardData) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <CardSpinner text="Loading mentor dashboard..." />
      </div>
    );
  }

  // Show error state with retry option
  if (error && !dashboardData) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
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
  // DATA PROCESSING
  // ===================================
  
  // Process stats cards data
  const statsCards = [
    {
      title: 'Active Students',
      value: dashboardData?.stats?.active_students || 0,
      change: '+2 this week',
      changeType: 'positive',
      icon: 'Users',
      iconColor: COLORS.PRIMARY,
      onClick: () => navigate('/mentor/students'),
    },
    {
      title: 'Upcoming Sessions',
      value: dashboardData?.stats?.upcoming_sessions || 0,
      change: `${dashboardData?.upcoming_sessions?.length || 0} today`,
      changeType: 'neutral',
      icon: 'Calendar',
      iconColor: COLORS.SUCCESS,
      onClick: () => navigate('/mentor/sessions'),
    },
    {
      title: 'Unread Messages',
      value: dashboardData?.stats?.unread_messages || 0,
      change: dashboardData?.stats?.unread_messages > 0 ? 'New messages' : 'All caught up',
      changeType: dashboardData?.stats?.unread_messages > 0 ? 'neutral' : 'positive',
      icon: 'MessageSquare',
      iconColor: COLORS.WARNING,
      onClick: () => navigate('/mentor/messages'),
    },
    {
      title: 'Completion Rate',
      value: `${dashboardData?.stats?.completion_rate || 0}%`,
      change: '+5% this month',
      changeType: 'positive',
      icon: 'TrendingUp',
      iconColor: COLORS.ACCENT,
      onClick: () => navigate('/mentor/analytics'),
    },
  ];

  // Process quick actions data
  const quickActions = [
    {
      title: 'Schedule Session',
      description: 'Book a new session with a student',
      icon: Calendar,
      color: COLORS.PRIMARY,
      onClick: () => navigate('/mentor/sessions/new'),
    },
    {
      title: 'Send Message',
      description: 'Send a message to your students',
      icon: MessageSquare,
      color: COLORS.SUCCESS,
      onClick: () => navigate('/mentor/messages/new'),
    },
    {
      title: 'View Analytics',
      description: 'Check your mentorship performance',
      icon: TrendingUp,
      color: COLORS.WARNING,
      onClick: () => navigate('/mentor/analytics'),
    },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {dashboardData?.mentor_profile?.user?.first_name || 'Mentor'}! 
            Here's an overview of your mentoring activities.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Timeframe Selector */}
          <select 
            value={selectedTimeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh dashboard data"
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

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Students Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Active Students</h2>
              <button
                onClick={() => navigate('/mentor/students')}
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-sm font-medium"
              >
                <span>View all</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Active Students List */}
            {dashboardData?.active_assignments && dashboardData.active_assignments.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.active_assignments.slice(0, 3).map((assignment) => (
                  <StudentCard
                    key={assignment.id}
                    student={assignment.student}
                    assignment={assignment}
                    showActions={false}
                    className="border-0 shadow-none hover:shadow-sm p-4"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active students</h3>
                <p className="text-gray-500 mb-4">
                  You don't have any active student assignments yet.
                </p>
                <button
                  onClick={() => navigate('/mentor/students')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Students
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Upcoming Sessions</h3>
              <button
                onClick={() => navigate('/mentor/sessions')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </button>
            </div>

            {dashboardData?.upcoming_sessions && dashboardData.upcoming_sessions.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcoming_sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{session.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.scheduled_at).toLocaleDateString()} at {' '}
                        {new Date(session.scheduled_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        with {session.assignment?.student?.full_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Calendar size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No upcoming sessions</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${action.color}20` }}
                  >
                    <action.icon size={16} style={{ color: action.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{action.title}</p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Loading Overlay */}
      {refreshing && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <LoadingSpinner text="Refreshing..." />
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard; 