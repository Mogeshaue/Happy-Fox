/**
 * Organization Management Component
 * Single Responsibility: Manage organizations (CRUD operations)
 * Following SOLID principles and mentor patterns
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Settings,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import useAdminFlowStore from '../store/adminFlowStore.js';
import { COLORS, ORGANIZATION_STATUS, BILLING_TIERS } from '../utils/constants.js';

// Loading Spinner Component
const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center space-y-2">
      <div className="animate-spin rounded-full w-8 h-8 border-b-2 border-blue-600"></div>
      <span className="text-gray-600">{text}</span>
    </div>
  </div>
);

// Organization Card Component
const OrganizationCard = ({ organization, onEdit, onDelete, onView, onManageUsers }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status) => {
    return ORGANIZATION_STATUS[status?.toUpperCase()]?.color || COLORS.SECONDARY;
  };

  const getStatusLabel = (status) => {
    return ORGANIZATION_STATUS[status?.toUpperCase()]?.label || status;
  };

  const getBillingTierLabel = (tier) => {
    const billingTier = BILLING_TIERS.find(t => t.value === tier);
    return billingTier?.label || tier;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
            style={{ backgroundColor: organization.default_logo_color || COLORS.PRIMARY }}
          >
            {organization.name?.charAt(0) || 'O'}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{organization.name}</h3>
            <p className="text-sm text-gray-500">@{organization.slug}</p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onView(organization);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Eye size={16} />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    onEdit(organization);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onManageUsers(organization);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Users size={16} />
                  <span>Manage Users</span>
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    onDelete(organization);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status and Billing */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${getStatusColor(organization.status || 'active')}15`,
              color: getStatusColor(organization.status || 'active')
            }}
          >
            {getStatusLabel(organization.status || 'active')}
          </span>
          <span className="text-xs text-gray-500">
            {getBillingTierLabel(organization.billing_tier)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Users</p>
          <p className="text-sm font-medium text-gray-900">
            {organization.current_user_count || 0} / {organization.max_users || '∞'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Storage</p>
          <p className="text-sm font-medium text-gray-900">
            {organization.storage_used || '0'} / {organization.storage_limit_gb || '∞'}GB
          </p>
        </div>
      </div>

      {/* Created Date */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Created {new Date(organization.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

const OrganizationManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    organizations,
    isLoading,
    error,
    fetchOrganizations,
    deleteOrganization
  } = useAdminFlowStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch organizations on component mount
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrganizations();
    } catch (error) {
      console.error('Failed to refresh organizations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateOrganization = () => {
    navigate('/admin-flow/organizations/new');
  };

  const handleViewOrganization = (organization) => {
    navigate(`/admin-flow/organizations/${organization.id}`);
  };

  const handleEditOrganization = (organization) => {
    navigate(`/admin-flow/organizations/${organization.id}/edit`);
  };

  const handleManageUsers = (organization) => {
    navigate(`/admin-flow/organizations/${organization.id}/users`);
  };

  const handleDeleteOrganization = async (organization) => {
    if (window.confirm(`Are you sure you want to delete "${organization.name}"? This action cannot be undone.`)) {
      try {
        await deleteOrganization(organization.id);
      } catch (error) {
        console.error('Failed to delete organization:', error);
      }
    }
  };

  // Filter organizations
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = !searchQuery || 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (org.status || 'active').toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (isLoading && !organizations.length) {
    return <LoadingSpinner text="Loading organizations..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600 mt-1">
            Manage organizations and their settings
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleCreateOrganization}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Organization</span>
          </button>
        </div>
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

      {/* Filters */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Organizations Grid */}
      {filteredOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
              onView={handleViewOrganization}
              onEdit={handleEditOrganization}
              onDelete={handleDeleteOrganization}
              onManageUsers={handleManageUsers}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || filterStatus !== 'all' ? 'No organizations found' : 'No organizations yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first organization'
            }
          </p>
          {(!searchQuery && filterStatus === 'all') && (
            <button
              onClick={handleCreateOrganization}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Organization
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationManagement;
