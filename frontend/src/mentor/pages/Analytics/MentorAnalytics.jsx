import React, { useEffect, useState } from 'react';
import { 
  TrendingUp,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  Award,
  BarChart3,
  PieChart,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import LoadingSpinner, { CardSpinner } from '../../components/common/LoadingSpinner.jsx';
import StatsCard from '../../components/common/StatsCard.jsx';
import MentorBreadcrumb from '../../layout/MentorBreadcrumb.jsx';
import { COLORS } from '../../utils/constants.js';

// ===================================
// MOCK DATA (Replace with API calls)
// ===================================
const MOCK_ANALYTICS_DATA = {
  overview: {
    total_students: 8,
    active_students: 3,
    total_sessions: 45,
    completed_sessions: 42,
    total_messages: 156,
    unread_messages: 2,
    avg_rating: 4.8,
    completion_rate: 93
  },
  monthly_stats: [
    { month: 'Jan', sessions: 8, students: 3, rating: 4.6 },
    { month: 'Feb', sessions: 12, students: 4, rating: 4.7 },
    { month: 'Mar', sessions: 15, students: 5, rating: 4.8 },
    { month: 'Apr', sessions: 10, students: 3, rating: 4.9 }
  ],
  session_distribution: [
    { type: 'Completed', count: 42, color: '#22c55e' },
    { type: 'Cancelled', count: 2, color: '#ef4444' },
    { type: 'Rescheduled', count: 1, color: '#f59e0b' }
  ],
  student_progress: [
    { student: 'Alice Johnson', progress: 85, sessions: 12 },
    { student: 'Bob Smith', progress: 65, sessions: 8 },
    { student: 'Charlie Brown', progress: 45, sessions: 6 }
  ],
  time_analytics: {
    avg_session_duration: 75,
    total_mentoring_hours: 56,
    peak_hours: ['2:00 PM', '3:00 PM', '4:00 PM'],
    busiest_day: 'Wednesday'
  }
};

/**
 * MentorAnalytics - Component for displaying mentor performance analytics
 * 
 * This component provides:
 * - Performance metrics and KPIs
 * - Session analytics and trends
 * - Student progress tracking
 * - Time-based analytics
 * - Visual charts and graphs
 * 
 * @returns {JSX.Element} The mentor analytics page
 */
const MentorAnalytics = () => {
  // ===================================
  // STATE MANAGEMENT
  // ===================================
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('last_3_months');

  // ===================================
  // API INTEGRATION (Currently using mock data)
  // TODO: Replace mock data with actual API calls
  // ===================================

  /**
   * Fetches analytics data from the backend API
   * Currently uses mock data - replace with actual API call
   */
  const fetchAnalyticsData = async () => {
    try {
      setError(null);
      setLoading(true);
      // Replace with your real backend endpoint for mentor analytics
      // Example: /mentor/api/analytics/ or similar
      const queryParams = new URLSearchParams({
        time_range: timeRange
      });
      const response = await fetch(`http://127.0.0.1:8000/mentor/api/analytics/?${queryParams}`, {
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
        setAnalyticsData(data.data);
      } else if (data.results) {
        setAnalyticsData(data.results);
      } else if (Array.isArray(data)) {
        setAnalyticsData(data);
      } else {
        setAnalyticsData(null);
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // COMPONENT LIFECYCLE
  // ===================================
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  // ===================================
  // ERROR HANDLING & LOADING STATES
  // ===================================
  
  if (loading) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <CardSpinner text="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // Process stats cards data
  const statsCards = [
    {
      title: 'Total Students',
      value: analyticsData?.overview?.total_students || 0,
      change: '+2 this month',
      changeType: 'positive',
      icon: 'Users',
      iconColor: COLORS.PRIMARY,
    },
    {
      title: 'Completed Sessions',
      value: analyticsData?.overview?.completed_sessions || 0,
      change: `${analyticsData?.overview?.completion_rate || 0}% completion rate`,
      changeType: 'positive',
      icon: 'Calendar',
      iconColor: COLORS.SUCCESS,
    },
    {
      title: 'Average Rating',
      value: `${analyticsData?.overview?.avg_rating || 0}⭐`,
      change: '+0.2 this month',
      changeType: 'positive',
      icon: 'Award',
      iconColor: COLORS.WARNING,
    },
    {
      title: 'Total Hours',
      value: `${analyticsData?.time_analytics?.total_mentoring_hours || 0}h`,
      change: '+12h this month',
      changeType: 'positive',
      icon: 'Clock',
      iconColor: COLORS.ACCENT,
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Track your mentoring performance and insights.
          </p>
        </div>

        {/* Time Range Selector */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="last_month">Last Month</option>
          <option value="last_3_months">Last 3 Months</option>
          <option value="last_6_months">Last 6 Months</option>
          <option value="last_year">Last Year</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Session Distribution</h2>
          </div>
          
          <div className="space-y-4">
            {analyticsData?.session_distribution?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-700">{item.type}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{item.count}</span>
                  <div className="text-xs text-gray-500">
                    {Math.round((item.count / analyticsData.overview.total_sessions) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Monthly Trends</h2>
          </div>
          
          <div className="space-y-4">
            {analyticsData?.monthly_stats?.map((month, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{month.month}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {month.sessions} sessions
                    </span>
                    <div className="text-xs text-gray-500">
                      {month.rating}⭐ avg rating
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(month.sessions / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Student Progress</h2>
          </div>
          
          <div className="space-y-4">
            {analyticsData?.student_progress?.map((student, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{student.student}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {student.progress}%
                    </span>
                    <div className="text-xs text-gray-500">
                      {student.sessions} sessions
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${student.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Analytics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Time Analytics</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Session Duration</span>
              <span className="font-semibold text-gray-900">
                {analyticsData?.time_analytics?.avg_session_duration || 0} min
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Hours</span>
              <span className="font-semibold text-gray-900">
                {analyticsData?.time_analytics?.total_mentoring_hours || 0}h
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Busiest Day</span>
              <span className="font-semibold text-gray-900">
                {analyticsData?.time_analytics?.busiest_day || 'N/A'}
              </span>
            </div>
            
            <div>
              <span className="text-gray-600 block mb-2">Peak Hours</span>
              <div className="flex flex-wrap gap-2">
                {analyticsData?.time_analytics?.peak_hours?.map((hour, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium"
                  >
                    {hour}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {analyticsData?.overview?.completion_rate || 0}%
            </div>
            <div className="text-sm text-green-700">Session Completion Rate</div>
            <div className="text-xs text-green-600 mt-1">Above average!</div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {((analyticsData?.overview?.unread_messages || 0) / (analyticsData?.overview?.total_messages || 1) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-blue-700">Response Rate</div>
            <div className="text-xs text-blue-600 mt-1">Excellent communication!</div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {analyticsData?.overview?.avg_rating || 0}⭐
            </div>
            <div className="text-sm text-purple-700">Average Rating</div>
            <div className="text-xs text-purple-600 mt-1">Outstanding mentor!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorAnalytics; 