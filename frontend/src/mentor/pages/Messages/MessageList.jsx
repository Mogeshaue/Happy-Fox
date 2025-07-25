import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare,
  Search,
  Filter,
  Plus,
  Users,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import LoadingSpinner, { CardSpinner } from '../../components/common/LoadingSpinner.jsx';
import MentorBreadcrumb from '../../layout/MentorBreadcrumb.jsx';

// ===================================
// MOCK DATA (Replace with API calls)
// ===================================
const MOCK_MESSAGE_THREADS = [
  {
    id: 1,
    student: {
      id: 1,
      full_name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      default_dp_color: '#10b981'
    },
    last_message: {
      content: 'Thanks for the session today! I have a question about React hooks.',
      created_at: '2024-12-19T16:30:00Z',
      sender_type: 'student'
    },
    unread_count: 2,
    total_messages: 15
  },
  {
    id: 2,
    student: {
      id: 2,
      full_name: 'Bob Smith',
      email: 'bob.smith@example.com',
      default_dp_color: '#f59e0b'
    },
    last_message: {
      content: 'Could we reschedule tomorrow\'s session to next week?',
      created_at: '2024-12-18T10:15:00Z',
      sender_type: 'student'
    },
    unread_count: 0,
    total_messages: 8
  }
];

/**
 * MessageList - Component for displaying message conversations
 * 
 * This component provides:
 * - List of all message threads with students
 * - Search and filtering functionality
 * - Unread message indicators
 * - Quick actions for messaging
 * 
 * @returns {JSX.Element} The message list page
 */
const MessageList = () => {
  // ===================================
  // STATE MANAGEMENT
  // ===================================
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ===================================
  // API INTEGRATION (Currently using mock data)
  // TODO: Replace mock data with actual API calls
  // ===================================

  /**
   * Fetches message threads from the backend API
   * Currently uses mock data - replace with actual API call
   */
  const fetchMessageThreads = async () => {
    try {
      setError(null);
      setLoading(true);
      // Replace with your real backend endpoint for mentor messages
      // Example: /mentor/api/messages/ or similar
      const response = await fetch('http://127.0.0.1:8000/mentor/api/messages/', {
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
        setThreads(data.data);
      } else if (data.results) {
        setThreads(data.results);
      } else if (Array.isArray(data)) {
        setThreads(data);
      } else {
        setThreads([]);
      }
    } catch (err) {
      console.error('Messages fetch error:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // COMPONENT LIFECYCLE
  // ===================================
  useEffect(() => {
    fetchMessageThreads();
  }, []);

  // Filter threads based on search
  const filteredThreads = threads.filter(thread =>
    thread.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===================================
  // ERROR HANDLING & LOADING STATES
  // ===================================
  
  if (loading) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <CardSpinner text="Loading messages..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Messages</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchMessageThreads}
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
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">
            Communicate with your students and track conversations.
          </p>
        </div>

        <button
          onClick={() => navigate('/mentor/messages/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>New Message</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Message Threads */}
      {filteredThreads.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => navigate(`/mentor/messages/${thread.id}`)}
              className="p-6 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors last:border-b-0"
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: thread.student?.default_dp_color }}
                >
                  {thread.student?.full_name?.charAt(0) || 'S'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {thread.student?.full_name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {thread.unread_count > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {thread.unread_count}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(thread.last_message?.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 truncate mb-2">
                    {thread.last_message?.content || 'No messages yet'}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <MessageSquare size={14} />
                      <span>{thread.total_messages} messages</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>
                        {new Date(thread.last_message?.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? 'Try adjusting your search criteria.'
              : 'Start a conversation with your students.'
            }
          </p>
          <button
            onClick={() => navigate('/mentor/messages/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send First Message
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageList; 