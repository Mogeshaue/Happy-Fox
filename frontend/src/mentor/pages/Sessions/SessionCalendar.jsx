import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import LoadingSpinner, { CardSpinner } from '../../components/common/LoadingSpinner.jsx';
import MentorBreadcrumb from '../../layout/MentorBreadcrumb.jsx';
import { COLORS } from '../../utils/constants.js';

// ===================================
// MOCK DATA (Replace with API calls)
// ===================================
const MOCK_CALENDAR_SESSIONS = [
  {
    id: 1,
    title: 'React Fundamentals Review',
    scheduled_at: '2024-12-20T14:00:00Z',
    duration_minutes: 60,
    status: 'scheduled',
    student: { full_name: 'Alice Johnson', default_dp_color: '#10b981' }
  },
  {
    id: 2,
    title: 'Node.js Project Discussion',
    scheduled_at: '2024-12-21T10:00:00Z',
    duration_minutes: 90,
    status: 'scheduled',
    student: { full_name: 'Bob Smith', default_dp_color: '#f59e0b' }
  },
  {
    id: 3,
    title: 'Python Data Analysis',
    scheduled_at: '2024-12-22T16:00:00Z',
    duration_minutes: 75,
    status: 'in_progress',
    student: { full_name: 'Eve Davis', default_dp_color: '#8b5cf6' }
  }
];

/**
 * SessionCalendar - Component for viewing sessions in calendar format
 * 
 * This component provides:
 * - Calendar view of scheduled sessions
 * - Month navigation
 * - Session details on hover/click
 * - Quick scheduling functionality
 * 
 * @returns {JSX.Element} The session calendar page
 */
const SessionCalendar = () => {
  // ===================================
  // STATE MANAGEMENT
  // ===================================
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // ===================================
  // API INTEGRATION (Currently using mock data)
  // TODO: Replace mock data with actual API calls
  // ===================================

  /**
   * Fetches calendar sessions from the backend API
   * Currently uses mock data - replace with actual API call
   */
  const fetchCalendarSessions = async () => {
    try {
      setError(null);
      
      // MOCK DATA USAGE
      // TODO: Replace this with actual API call
      // Example API call (commented out):
      /*
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const queryParams = new URLSearchParams({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

      const response = await fetch(`http://127.0.0.1:8000/mentor/api/sessions/?${queryParams}`, {
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
        setSessions(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch calendar sessions');
      }
      */

      // Simulate API delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use mock data for now
      setSessions(MOCK_CALENDAR_SESSIONS);
      
    } catch (err) {
      console.error('Calendar fetch error:', err);
      setError(err.message || 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to previous month
   */
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  /**
   * Navigate to next month
   */
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  /**
   * Generate calendar days for the current month
   */
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, sessions: [] });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.scheduled_at);
        return sessionDate.toDateString() === dayDate.toDateString();
      });
      
      days.push({ day, date: dayDate, sessions: daySessions });
    }
    
    return days;
  };

  // ===================================
  // COMPONENT LIFECYCLE
  // ===================================
  useEffect(() => {
    fetchCalendarSessions();
  }, [currentDate]);

  // ===================================
  // ERROR HANDLING & LOADING STATES
  // ===================================
  
  if (loading) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <CardSpinner text="Loading calendar..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Calendar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCalendarSessions}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
          <h1 className="text-2xl font-bold text-gray-900">Session Calendar</h1>
          <p className="text-gray-600">
            View your scheduled sessions in calendar format.
          </p>
        </div>

        <button
          onClick={() => navigate('/mentor/sessions/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Schedule Session</span>
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 border-b">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((dayData, index) => (
            <div key={index} className="min-h-[120px] p-2 border border-gray-100 bg-white hover:bg-gray-50 transition-colors">
              {dayData.day && (
                <>
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {dayData.day}
                  </div>
                  
                  {/* Sessions for this day */}
                  <div className="space-y-1">
                    {dayData.sessions.slice(0, 3).map(session => (
                      <div
                        key={session.id}
                        onClick={() => navigate(`/mentor/sessions/${session.id}`)}
                        className="text-xs p-1 rounded cursor-pointer truncate"
                        style={{
                          backgroundColor: session.status === 'scheduled' ? '#dbeafe' : '#dcfce7',
                          color: session.status === 'scheduled' ? '#1e40af' : '#166534'
                        }}
                        title={`${session.title} - ${session.student.full_name}`}
                      >
                        <div className="flex items-center space-x-1">
                          <Clock size={10} />
                          <span>
                            {new Date(session.scheduled_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className="truncate">{session.title}</div>
                      </div>
                    ))}
                    
                    {dayData.sessions.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayData.sessions.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <Calendar size={32} className="mx-auto text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{sessions.length}</div>
          <div className="text-sm text-gray-600">Sessions This Month</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <Users size={32} className="mx-auto text-green-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {new Set(sessions.map(s => s.student?.full_name)).size}
          </div>
          <div className="text-sm text-gray-600">Unique Students</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <Clock size={32} className="mx-auto text-purple-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {sessions.reduce((total, session) => total + session.duration_minutes, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Minutes</div>
        </div>
      </div>
    </div>
  );
};

export default SessionCalendar; 