/**
 * Admin Flow Constants
 * Single Responsibility: Define constants used across admin flow components
 */

export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4'
};

export const ADMIN_FLOW_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin-flow/dashboard',
    icon: 'LayoutDashboard',
    description: 'Overview & Analytics'
  },
  {
    id: 'organizations',
    label: 'Organizations',
    path: '/admin-flow/organizations',
    icon: 'Building2',
    description: 'Manage Organizations'
  },
  {
    id: 'users',
    label: 'User Management',
    path: '/admin-flow/users',
    icon: 'Users',
    description: 'Manage Users & Roles'
  },
  {
    id: 'system',
    label: 'System Config',
    path: '/admin-flow/system',
    icon: 'Settings',
    description: 'System Settings'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/admin-flow/analytics',
    icon: 'BarChart3',
    description: 'Reports & Insights'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: '/admin-flow/notifications',
    icon: 'Bell',
    description: 'Admin Notifications'
  }
];

export const ORGANIZATION_STATUS = {
  ACTIVE: { label: 'Active', color: COLORS.SUCCESS },
  INACTIVE: { label: 'Inactive', color: COLORS.ERROR },
  PENDING: { label: 'Pending', color: COLORS.WARNING },
  SUSPENDED: { label: 'Suspended', color: COLORS.ERROR }
};

export const USER_ROLES = {
  OWNER: { label: 'Owner', color: COLORS.PRIMARY },
  ADMIN: { label: 'Admin', color: COLORS.INFO },
  MEMBER: { label: 'Member', color: COLORS.SECONDARY }
};

export const ADMIN_PERMISSIONS = [
  'manage_organizations',
  'manage_users',
  'manage_content',
  'view_analytics',
  'system_configuration',
  'send_notifications',
  'bulk_operations',
  'export_data'
];

export const BILLING_TIERS = [
  { value: 'free', label: 'Free Tier', maxUsers: 50 },
  { value: 'basic', label: 'Basic Plan', maxUsers: 200 },
  { value: 'premium', label: 'Premium Plan', maxUsers: 1000 },
  { value: 'enterprise', label: 'Enterprise', maxUsers: -1 }
];

export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'json', label: 'JSON' }
];

export const TIME_PERIODS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '365d', label: 'Last year' }
];
