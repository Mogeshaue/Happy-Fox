/**
 * Admin Flow Dashboard Component
 * Single Responsibility: Display admin dashboard overview
 * Following mentor dashboard pattern for consistency
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import useAdminFlowStore from '../store/adminFlowStore.js';
import { COLORS } from '../utils/constants.js';

// Loading Spinner Component
const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center space-y-2">
      <div className="animate-spin rounded-full w-8 h-8 border-b-2 border-blue-600"></div>
      <span className="text-gray-600">{text}</span>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, color, onClick }) => (
  <div 
    className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${
      onClick ? 'cursor-pointer hover:border-blue-300' : ''
    }`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <div className="flex items-center mt-2">
            {change.type === 'increase' ? (
              <TrendingUp size={16} className="text-green-600 mr-1" />
            ) : (
              <TrendingDown size={16} className="text-red-600 mr-1" />
            )}
            <span className={`text-sm ${
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change.value}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </div>
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={24} style={{ color }} />
      </div>
    </div>
  </div>
);

// Recent Activity Component
const RecentActivity = ({ activities }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      <Clock size={20} className="text-gray-400" />
    </div>
    
    {activities && activities.length > 0 ? (
      <div className="space-y-4">
        {activities.slice(0, 5).map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.action || 'System Activity'}
              </p>
              <p className="text-sm text-gray-600">
                {activity.description || 'Activity description'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
              </p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
        <p>No recent activity</p>
      </div>
    )}
  </div>
);

const AdminFlowDashboard = () => {
  const navigate = useNavigate();
  const {
    dashboardData,
    analytics,
    organizations,
    users,
    isLoading,
    error,
    fetchDashboardData,
    fetchOrganizations,
    fetchUsers
  } = useAdminFlowStore();

  const [refreshing, setRefreshing] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await Promise.all([
          fetchDashboardData(),
          fetchOrganizations(),
          fetchUsers()
        ]);
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      }
    };

    initializeDashboard();
  }, [fetchDashboardData, fetchOrganizations, fetchUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchOrganizations(),
        fetchUsers()
      ]);
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Quick actions data
  const quickActions = [
    {
      title: 'Create Organization',
      description: 'Add a new organization',
      icon: Building2,
      color: COLORS.PRIMARY,
      onClick: () => navigate('/admin-flow/organizations/new'),
    },
    {
      title: 'Add User',
      description: 'Create a new user account',
      icon: Users,
      color: COLORS.SUCCESS,
      onClick: () => navigate('/admin-flow/users/new'),
    },
    {
      title: 'View Analytics',
      description: 'Check system analytics',
      icon: BarChart3,
      color: COLORS.WARNING,
      onClick: () => navigate('/admin-flow/analytics'),
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: Settings,
      color: COLORS.INFO,
      onClick: () => navigate('/admin-flow/system'),
    },
  ];

  // Process dashboard stats
  const stats = [
    {
      title: 'Total Organizations',
      value: dashboardData?.total_organizations || organizations?.length || 0,
      change: { type: 'increase', value: '+12%' },
      icon: Building2,
      color: COLORS.PRIMARY,
      onClick: () => navigate('/admin-flow/organizations')
    },
    {
      title: 'Active Users',
      value: dashboardData?.active_users || users?.length || 0,
      change: { type: 'increase', value: '+8%' },
      icon: Users,
      color: COLORS.SUCCESS,
      onClick: () => navigate('/admin-flow/users')
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: { type: 'increase', value: '+0.1%' },
      icon: CheckCircle,
      color: COLORS.SUCCESS,
      onClick: () => navigate('/admin-flow/system')
    },
    {
      title: 'Storage Used',
      value: dashboardData?.storage_used || '2.4GB',
      change: { type: 'increase', value: '+150MB' },
      icon: BarChart3,
      color: COLORS.WARNING,
      onClick: () => navigate('/admin-flow/analytics')
    }
  ];

  if (isLoading && !dashboardData) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your system.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800">Error: {error}</p>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity activities={dashboardData?.recent_activities || []} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${action.color}15` }}
                >
                  <action.icon size={16} style={{ color: action.color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Refresh Loading Overlay */}
      {refreshing && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <LoadingSpinner text="Refreshing dashboard..." />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFlowDashboard;
