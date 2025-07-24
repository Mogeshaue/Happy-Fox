import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Calendar, TrendingUp, MoreVertical } from 'lucide-react';
import { COLORS, ASSIGNMENT_STATUS } from '../../utils/constants.js';

const StudentCard = ({ student, assignment, className = '', showActions = true }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    return ASSIGNMENT_STATUS[status?.toUpperCase()]?.color || COLORS.SECONDARY;
  };

  const getStatusLabel = (status) => {
    return ASSIGNMENT_STATUS[status?.toUpperCase()]?.label || status;
  };

  const formatDuration = (weeks) => {
    if (!weeks) return 'No duration set';
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  };

  const calculateProgress = () => {
    // This would be calculated based on actual data
    // For now, return a mock progress
    return Math.floor(Math.random() * 100);
  };

  const handleCardClick = () => {
    navigate(`/mentor/students/${student.id}`);
  };

  const handleMessageClick = (e) => {
    e.stopPropagation();
    navigate(`/mentor/messages/${assignment.id}`);
  };

  const handleSessionClick = (e) => {
    e.stopPropagation();
    navigate(`/mentor/sessions?student=${student.id}`);
  };

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
            style={{ backgroundColor: student.default_dp_color || COLORS.PRIMARY }}
          >
            {student.first_name?.charAt(0) || student.full_name?.charAt(0) || 'S'}
          </div>

          {/* Student Info */}
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.email}
            </h3>
            <p className="text-sm text-gray-500">{student.email}</p>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex items-center space-x-2">
          <span 
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${getStatusColor(assignment.status)}20`,
              color: getStatusColor(assignment.status)
            }}
          >
            {getStatusLabel(assignment.status)}
          </span>

          {showActions && (
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Assignment Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Cohort:</span>
          <span className="font-medium text-gray-900">{assignment.cohort?.name || 'N/A'}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Duration:</span>
          <span className="font-medium text-gray-900">
            {formatDuration(assignment.expected_duration_weeks)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Started:</span>
          <span className="font-medium text-gray-900">
            {assignment.started_at 
              ? new Date(assignment.started_at).toLocaleDateString()
              : 'Not started'
            }
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium text-gray-900">{calculateProgress()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${calculateProgress()}%`,
              backgroundColor: COLORS.SUCCESS 
            }}
          ></div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMessageClick}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex-1 justify-center"
          >
            <MessageSquare size={16} />
            <span>Message</span>
          </button>

          <button
            onClick={handleSessionClick}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex-1 justify-center"
          >
            <Calendar size={16} />
            <span>Schedule</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentCard; 