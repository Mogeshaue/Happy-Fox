/**
 * User Management Component
 * Single Responsibility: Manage users (CRUD operations)
 * Following SOLID principles and mentor patterns
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Eye,
  UserPlus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import useAdminFlowStore from '../store/adminFlowStore.js';
import { COLORS, USER_ROLES } from '../utils/constants.js';

// Loading Spinner Component
const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center space-y-2">
      <div className="animate-spin rounded-full w-8 h-8 border-b-2 border-blue-600"></div>
      <span className="text-gray-600">{text}</span>
    </div>
  </div>
);

// User Card Component
const UserCard = ({ user, onEdit, onDelete, onView, onChangeRole }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getRoleColor = (role) => {
    return USER_ROLES[role?.toUpperCase()]?.color || COLORS.SECONDARY;
  };

  const getRoleLabel = (role) => {
    return USER_ROLES[role?.toUpperCase()]?.label || role;
  };

  const getStatusIcon = (isActive) => {
    return isActive ? (
      <CheckCircle size={16} className="text-green-600" />
    ) : (
      <XCircle size={16} className="text-red-600" />
    );
  };

  const getStatusLabel = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
            style={{ backgroundColor: user.default_dp_color || COLORS.PRIMARY }}
          >
            {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email}
            </h3>
            <p className="text-sm text-gray-500">{user.email}</p>
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
                    onView(user);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Eye size={16} />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    onEdit(user);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onChangeRole(user);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Shield size={16} />
                  <span>Change Role</span>
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    onDelete(user);
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

      {/* Role and Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${getRoleColor(user.role)}15`,
              color: getRoleColor(user.role)
            }}
          >
            {getRoleLabel(user.role)}
          </span>
          <div className="flex items-center space-x-1">
            {getStatusIcon(user.is_active)}
            <span className="text-xs text-gray-500">
              {getStatusLabel(user.is_active)}
            </span>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="space-y-2">
        {user.organizations && user.organizations.length > 0 && (
          <div>
            <p className="text-xs text-gray-500">Organizations</p>
            <p className="text-sm font-medium text-gray-900">
              {user.organizations.map(org => org.name).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Last Activity */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
          {user.last_login && (
            <span>Last seen {new Date(user.last_login).toLocaleDateString()}</span>
          )}
        </div>
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

const UserManagement = () => {
  const navigate = useNavigate();
  
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    deleteUser,
    updateUser
  } = useAdminFlowStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUsers();
    } catch (error) {
      console.error('Failed to refresh users:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateUser = () => {
    navigate('/admin-flow/users/new');
  };

  const handleViewUser = (user) => {
    navigate(`/admin-flow/users/${user.id}`);
  };

  const handleEditUser = (user) => {
    navigate(`/admin-flow/users/${user.id}/edit`);
  };

  const handleChangeRole = (user) => {
    // Open role change modal/form
    navigate(`/admin-flow/users/${user.id}/role`);
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete "${user.full_name || user.email}"? This action cannot be undone.`)) {
      try {
        await deleteUser(user.id);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || 
      (user.role || 'member').toLowerCase() === filterRole.toLowerCase();

    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' ? user.is_active : !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading && !users.length) {
    return <LoadingSpinner text="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts, roles, and permissions
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
            onClick={handleCreateUser}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={16} />
            <span>Add User</span>
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
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Role Filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Users size={20} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle size={20} className="text-green-600" />
            <span className="text-sm font-medium text-gray-900">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {users.filter(u => u.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Shield size={20} className="text-purple-600" />
            <span className="text-sm font-medium text-gray-900">Admins</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {users.filter(u => u.role === 'admin' || u.role === 'owner').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Clock size={20} className="text-orange-600" />
            <span className="text-sm font-medium text-gray-900">Recent</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {users.filter(u => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(u.created_at) > weekAgo;
            }).length}
          </p>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onChangeRole={handleChangeRole}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || filterRole !== 'all' || filterStatus !== 'all' ? 'No users found' : 'No users yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first user'
            }
          </p>
          {(!searchQuery && filterRole === 'all' && filterStatus === 'all') && (
            <button
              onClick={handleCreateUser}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create User
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
