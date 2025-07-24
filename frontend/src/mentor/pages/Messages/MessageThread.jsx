import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageSquare,
  Send,
  ArrowLeft,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import LoadingSpinner, { CardSpinner } from '../../components/common/LoadingSpinner.jsx';
import MentorBreadcrumb from '../../layout/MentorBreadcrumb.jsx';

// ===================================
// MOCK DATA (Replace with API calls)
// ===================================
const MOCK_THREAD_DETAILS = {
  id: 1,
  student: {
    id: 1,
    full_name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    default_dp_color: '#10b981'
  },
  messages: [
    {
      id: 1,
      content: 'Hi! I had some questions about the React hooks we covered in our last session.',
      sender_type: 'student',
      created_at: '2024-12-19T14:00:00Z',
      is_read: true
    },
    {
      id: 2,
      content: 'Of course! What specifically would you like to clarify?',
      sender_type: 'mentor',
      created_at: '2024-12-19T14:15:00Z',
      is_read: true
    },
    {
      id: 3,
      content: 'I\'m having trouble understanding when to use useCallback vs useMemo. Could you explain the difference?',
      sender_type: 'student',
      created_at: '2024-12-19T16:30:00Z',
      is_read: false
    }
  ]
};

/**
 * MessageThread - Component for viewing and sending messages in a conversation
 * 
 * This component provides:
 * - Message thread display
 * - Real-time message sending
 * - Message status indicators
 * - Responsive chat interface
 * 
 * @returns {JSX.Element} The message thread page
 */
const MessageThread = () => {
  // ===================================
  // STATE MANAGEMENT
  // ===================================
  const { id } = useParams();
  const navigate = useNavigate();
  const [threadData, setThreadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // ===================================
  // API INTEGRATION (Currently using mock data)
  // TODO: Replace mock data with actual API calls
  // ===================================

  /**
   * Fetches message thread from the backend API
   * Currently uses mock data - replace with actual API call
   */
  const fetchMessageThread = async () => {
    try {
      setError(null);
      
      // MOCK DATA USAGE
      // TODO: Replace this with actual API call
      // Example API call (commented out):
      /*
      const response = await fetch(`http://127.0.0.1:8000/mentor/api/messages/${id}/`, {
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
        setThreadData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch message thread');
      }
      */

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use mock data
      setThreadData(MOCK_THREAD_DETAILS);
      
    } catch (err) {
      console.error('Thread fetch error:', err);
      setError(err.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sends a new message via API
   * Currently uses mock data - replace with actual API call
   */
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      // MOCK DATA USAGE
      // TODO: Replace this with actual API call
      // Example API call (commented out):
      /*
      const response = await fetch('http://127.0.0.1:8000/mentor/api/messages/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Add if authentication is needed
        },
        body: JSON.stringify({
          thread_id: id,
          content: newMessage.trim(),
          sender_type: 'mentor'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Add the new message to the thread
        setThreadData(prev => ({
          ...prev,
          messages: [...prev.messages, data.data]
        }));
        setNewMessage('');
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
      */

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Add mock message
      const mockMessage = {
        id: Date.now(),
        content: newMessage.trim(),
        sender_type: 'mentor',
        created_at: new Date().toISOString(),
        is_read: true
      };
      
      setThreadData(prev => ({
        ...prev,
        messages: [...prev.messages, mockMessage]
      }));
      setNewMessage('');
      
    } catch (err) {
      console.error('Send message error:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // ===================================
  // COMPONENT LIFECYCLE
  // ===================================
  useEffect(() => {
    fetchMessageThread();
  }, [id]);

  // ===================================
  // ERROR HANDLING & LOADING STATES
  // ===================================
  
  if (loading) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <CardSpinner text="Loading conversation..." />
      </div>
    );
  }

  if (error && !threadData) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Conversation</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchMessageThread}
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
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/mentor/messages')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to messages"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: threadData?.student?.default_dp_color }}
          >
            {threadData?.student?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {threadData?.student?.full_name || 'Student'}
            </h1>
            <p className="text-sm text-gray-500">
              {threadData?.student?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-[600px]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {threadData?.messages?.length > 0 ? (
            threadData.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_type === 'mentor' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_type === 'mentor'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_type === 'mentor' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>No messages in this conversation yet.</p>
                <p className="text-sm">Send a message to get started!</p>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <LoadingSpinner size={16} />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageThread; 