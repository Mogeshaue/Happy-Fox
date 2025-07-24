import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Grid3X3, 
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import StudentCard from '../../components/common/StudentCard.jsx';
import LoadingSpinner, { CardSpinner } from '../../components/common/LoadingSpinner.jsx';
import MentorBreadcrumb from '../../layout/MentorBreadcrumb.jsx';
import { ASSIGNMENT_STATUS } from '../../utils/constants.js';

// ===================================
// MOCK DATA (Replace with API calls)
// ===================================
const MOCK_ASSIGNMENTS = [
  {
    id: 1,
    student: {
      id: 1,
      email: 'alice.johnson@example.com',
      first_name: 'Alice',
      last_name: 'Johnson',
      full_name: 'Alice Johnson',
      default_dp_color: '#10b981'
    },
    cohort: { 
      id: 1, 
      name: 'Web Development Bootcamp 2024',
      org: { name: 'Tech Academy' }
    },
    course: { 
      id: 1, 
      name: 'Full Stack JavaScript',
      description: 'Complete full stack development course'
    },
    status: 'active',
    priority: 'high',
    assigned_at: '2024-01-15T10:00:00Z',
    started_at: '2024-01-20T09:00:00Z',
    expected_duration_weeks: 12,
    progress_percentage: 65,
    last_session_at: '2024-12-15T14:00:00Z'
  },
  {
    id: 2,
    student: {
      id: 2,
      email: 'bob.smith@example.com',
      first_name: 'Bob',
      last_name: 'Smith',
      full_name: 'Bob Smith',
      default_dp_color: '#f59e0b'
    },
    cohort: { 
      id: 2, 
      name: 'Data Science Bootcamp',
      org: { name: 'Analytics Institute' }
    },
    course: { 
      id: 2, 
      name: 'Python Data Science',
      description: 'Advanced data science with Python'
    },
    status: 'active',
    priority: 'medium',
    assigned_at: '2024-02-01T09:00:00Z',
    started_at: '2024-02-05T10:30:00Z',
    expected_duration_weeks: 16,
    progress_percentage: 30,
    last_session_at: '2024-12-10T11:00:00Z'
  },
  {
    id: 3,
    student: {
      id: 3,
      email: 'charlie.brown@example.com',
      first_name: 'Charlie',
      last_name: 'Brown',
      full_name: 'Charlie Brown',
      default_dp_color: '#6366f1'
    },
    cohort: { 
      id: 1, 
      name: 'Web Development Bootcamp 2024',
      org: { name: 'Tech Academy' }
    },
    course: { 
      id: 1, 
      name: 'Full Stack JavaScript',
      description: 'Complete full stack development course'
    },
    status: 'pending',
    priority: 'low',
    assigned_at: '2024-03-01T15:00:00Z',
    started_at: null,
    expected_duration_weeks: 12,
    progress_percentage: 0,
    last_session_at: null
  },
  {
    id: 4,
    student: {
      id: 4,
      email: 'diana.prince@example.com',
      first_name: 'Diana',
      last_name: 'Prince',
      full_name: 'Diana Prince',
      default_dp_color: '#ec4899'
    },
    cohort: { 
      id: 3, 
      name: 'Mobile Development Bootcamp',
      org: { name: 'Mobile Masters' }
    },
    course: { 
      id: 3, 
      name: 'React Native Development',
      description: 'Cross-platform mobile app development'
    },
    status: 'completed',
    priority: 'high',
    assigned_at: '2023-10-01T10:00:00Z',
    started_at: '2023-10-05T09:00:00Z',
    completed_at: '2024-01-15T16:00:00Z',
    expected_duration_weeks: 14,
    progress_percentage: 100,
    last_session_at: '2024-01-12T13:00:00Z'
  },
  {
    id: 5,
    student: {
      id: 5,
      email: 'eve.davis@example.com',
      first_name: 'Eve',
      last_name: 'Davis',
      full_name: 'Eve Davis',
      default_dp_color: '#8b5cf6'
    },
    cohort: { 
      id: 2, 
      name: 'Data Science Bootcamp',
      org: { name: 'Analytics Institute' }
    },
    course: { 
      id: 2, 
      name: 'Python Data Science',
      description: 'Advanced data science with Python'
    },
    status: 'paused',
    priority: 'medium',
    assigned_at: '2024-01-10T12:00:00Z',
    started_at: '2024-01-15T11:00:00Z',
    expected_duration_weeks: 16,
    progress_percentage: 45,
    last_session_at: '2024-11-20T14:30:00Z'
  }
];

/**
 * StudentList - Component for displaying and managing assigned students
 * 
 * This component provides:
 * - List of assigned students with filtering and sorting
 * - Search functionality
 * - Grid/List view toggle
 * - Status filtering
 * - Navigation to individual student details
 * 
 * @returns {JSX.Element} The student list page
 */
const StudentList = () => {
  // ===================================
  // STATE MANAGEMENT
  // ===================================
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local component state
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter and display state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // ===================================
  // API INTEGRATION (Currently using mock data)
  // TODO: Replace mock data with actual API calls
  // ===================================

  /**
   * Fetches assignment data from the backend API
   * Currently uses mock data - replace with actual API call
   */
  const fetchAssignments = async (filters = {}) => {
    try {
      setError(null);
      
      // MOCK DATA USAGE
      // TODO: Replace this with actual API call
      // Example API call (commented out):
      /*
      const queryParams = new URLSearchParams({
        role: 'mentor',
        ...filters
      });

      const response = await fetch(`http://127.0.0.1:8000/mentor/api/assignments/?${queryParams}`, {
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
        setAssignments(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch assignments');
      }
      */

      // Simulate API delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Use mock data for now
      setAssignments(MOCK_ASSIGNMENTS);
      
    } catch (err) {
      console.error('Assignments fetch error:', err);
      setError(err.message || 'Failed to load student assignments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Refreshes assignments data
   * Provides user feedback during refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAssignments();
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
   * Handles sorting changes
   * @param {string} field - The field to sort by
   */
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  /**
   * Gets the appropriate sort icon for a field
   * @param {string} field - The field to check
   * @returns {JSX.Element|null} The sort icon or null
   */
  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />;
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
   * Filters and sorts assignments based on current criteria
   * Uses useMemo for performance optimization
   */
  const filteredAndSortedAssignments = useMemo(() => {
    let filtered = assignments.filter(assignment => {
      // Search filter - check student name, email, cohort name
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        assignment.student?.full_name?.toLowerCase().includes(searchLower) ||
        assignment.student?.email?.toLowerCase().includes(searchLower) ||
        assignment.cohort?.name?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'name':
          aVal = a.student?.full_name || a.student?.email || '';
          bVal = b.student?.full_name || b.student?.email || '';
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'date':
          aVal = new Date(a.assigned_at);
          bVal = new Date(b.assigned_at);
          break;
        case 'cohort':
          aVal = a.cohort?.name || '';
          bVal = b.cohort?.name || '';
          break;
        case 'progress':
          aVal = a.progress_percentage || 0;
          bVal = b.progress_percentage || 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [assignments, searchQuery, statusFilter, sortBy, sortOrder]);

  /**
   * Generates status filter options with counts
   */
  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Students', count: assignments.length },
    { value: 'active', label: 'Active', count: assignments.filter(a => a.status === 'active').length },
    { value: 'pending', label: 'Pending', count: assignments.filter(a => a.status === 'pending').length },
    { value: 'completed', label: 'Completed', count: assignments.filter(a => a.status === 'completed').length },
    { value: 'paused', label: 'Paused', count: assignments.filter(a => a.status === 'paused').length },
  ], [assignments]);

  // ===================================
  // COMPONENT LIFECYCLE
  // ===================================
  useEffect(() => {
    fetchAssignments();
  }, []);

  // ===================================
  // ERROR HANDLING & LOADING STATES
  // ===================================
  
  // Show loading spinner while fetching data
  if (loading && assignments.length === 0) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <CardSpinner text="Loading student assignments..." />
      </div>
    );
  }

  // Show error state with retry option
  if (error && assignments.length === 0) {
    return (
      <div className="space-y-6">
        <MentorBreadcrumb />
        <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Students</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAssignments}
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
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">
            Manage your assigned students and track their progress.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh student list"
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
                placeholder="Search students, cohorts..."
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

            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
                <option value="date">Sort by Date</option>
                <option value="cohort">Sort by Cohort</option>
                <option value="progress">Sort by Progress</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {getSortIcon(sortBy) || <SortAsc size={16} />}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid view"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredAndSortedAssignments.length} of {assignments.length} students
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

      {/* Students Grid/List */}
      {filteredAndSortedAssignments.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredAndSortedAssignments.map((assignment) => (
            <StudentCard
              key={assignment.id}
              student={assignment.student}
              assignment={assignment}
              showActions={true}
              className={viewMode === 'list' ? 'flex items-center p-4' : ''}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No students found' : 'No students assigned'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? 'Try adjusting your search criteria or filters.'
              : 'You don\'t have any student assignments yet.'
            }
          </p>
          {!searchQuery ? (
            <button
              onClick={() => navigate('/mentor/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
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
            <LoadingSpinner text="Refreshing students..." />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList; 