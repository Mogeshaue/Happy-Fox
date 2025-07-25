// API Configuration
export const API_BASE_URL = 'http://127.0.0.1:8000';
export const MENTOR_API_BASE = `${API_BASE_URL}/mentor/api`;

// API Endpoints
export const MENTOR_ENDPOINTS = {
  // Profile endpoints
  MENTOR_PROFILES: '/mentor-profiles',
  MY_PROFILE: '/mentor-profiles/me',
  CREATE_PROFILE: '/mentor-profiles/create',
  
  // Assignment endpoints
  ASSIGNMENTS: '/assignments',
  ASSIGNMENT_DETAIL: (id) => `/assignments/${id}`,
  ACTIVATE_ASSIGNMENT: (id) => `/assignments/${id}/activate`,
  
  // Session endpoints
  SESSIONS: '/sessions',
  SESSION_DETAIL: (id) => `/sessions/${id}`,
  
  // Message endpoints
  MESSAGES: '/messages',
  MARK_MESSAGE_READ: (id) => `/messages/${id}/read`,
  
  // Progress endpoints
  PROGRESS: '/progress',
  
  // Feedback endpoints
  FEEDBACK: '/feedback',
  ACKNOWLEDGE_FEEDBACK: (id) => `/feedback/${id}/acknowledge`,
  
  // Goals endpoints
  GOALS: '/goals',
  COMPLETE_GOAL: (id) => `/goals/${id}/complete`,
  
  // Notification endpoints
  NOTIFICATIONS: '/notifications',
  MARK_NOTIFICATION_READ: (id) => `/notifications/${id}/read`,
  
  // Dashboard endpoints
  DASHBOARD: '/dashboard',
  MENTOR_STUDENTS: '/mentor/students',
  MENTOR_STATS: '/mentor/stats',
  
  // Utility endpoints
  AVAILABLE_MENTORS: '/available-mentors',
  MENTOR_AVAILABILITY: (id) => `/mentor/${id}/availability`,
};

// Design System Constants
export const COLORS = {
  // Primary Colors
  PRIMARY: '#2563eb',           // Blue-600
  PRIMARY_DARK: '#1d4ed8',      // Blue-700
  PRIMARY_LIGHT: '#3b82f6',     // Blue-500
  PRIMARY_LIGHTEST: '#dbeafe',  // Blue-100
  
  // Secondary Colors
  SECONDARY: '#6b7280',         // Gray-500
  ACCENT: '#10b981',            // Emerald-500
  
  // Status Colors
  SUCCESS: '#10b981',           // Green-500
  WARNING: '#f59e0b',           // Amber-500
  ERROR: '#dc2626',             // Red-600
  INFO: '#3b82f6',              // Blue-500
  
  // Neutral Colors
  BG_PRIMARY: '#ffffff',        // White
  BG_SECONDARY: '#f9fafb',      // Gray-50
  BG_TERTIARY: '#f3f4f6',       // Gray-100
  TEXT_PRIMARY: '#111827',      // Gray-900
  TEXT_SECONDARY: '#6b7280',    // Gray-500
  TEXT_TERTIARY: '#9ca3af',     // Gray-400
  BORDER: '#e5e7eb',            // Gray-200
  BORDER_LIGHT: '#f3f4f6',      // Gray-100
};

// Component Sizes
export const SIZES = {
  SIDEBAR_WIDTH: '16rem',       // 256px
  NAVBAR_HEIGHT: '4rem',        // 64px
  CARD_PADDING: '1.5rem',       // 24px
  CONTENT_PADDING: '1.5rem',    // 24px
};

// Status Options
export const MENTOR_STATUS = {
  ACTIVE: { value: 'active', label: 'Active', color: COLORS.SUCCESS },
  INACTIVE: { value: 'inactive', label: 'Inactive', color: COLORS.SECONDARY },
  ON_LEAVE: { value: 'on_leave', label: 'On Leave', color: COLORS.WARNING },
};

export const ASSIGNMENT_STATUS = {
  PENDING: { value: 'pending', label: 'Pending', color: COLORS.WARNING },
  ACTIVE: { value: 'active', label: 'Active', color: COLORS.SUCCESS },
  COMPLETED: { value: 'completed', label: 'Completed', color: COLORS.PRIMARY },
  CANCELLED: { value: 'cancelled', label: 'Cancelled', color: COLORS.ERROR },
  PAUSED: { value: 'paused', label: 'Paused', color: COLORS.SECONDARY },
};

export const SESSION_STATUS = {
  SCHEDULED: { value: 'scheduled', label: 'Scheduled', color: COLORS.PRIMARY },
  IN_PROGRESS: { value: 'in_progress', label: 'In Progress', color: COLORS.SUCCESS },
  COMPLETED: { value: 'completed', label: 'Completed', color: COLORS.SUCCESS },
  CANCELLED: { value: 'cancelled', label: 'Cancelled', color: COLORS.ERROR },
  NO_SHOW: { value: 'no_show', label: 'No Show', color: COLORS.WARNING },
};

export const EXPERIENCE_LEVELS = {
  JUNIOR: { value: 'junior', label: 'Junior (0-2 years)', color: COLORS.INFO },
  MID: { value: 'mid', label: 'Mid-level (2-5 years)', color: COLORS.PRIMARY },
  SENIOR: { value: 'senior', label: 'Senior (5-10 years)', color: COLORS.SUCCESS },
  EXPERT: { value: 'expert', label: 'Expert (10+ years)', color: COLORS.ACCENT },
};

export const PRIORITY_LEVELS = {
  LOW: { value: 'low', label: 'Low', color: COLORS.SECONDARY },
  MEDIUM: { value: 'medium', label: 'Medium', color: COLORS.WARNING },
  HIGH: { value: 'high', label: 'High', color: COLORS.ERROR },
  URGENT: { value: 'urgent', label: 'Urgent', color: COLORS.ERROR },
};

// Navigation Items
export const MENTOR_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/mentor/dashboard',
    icon: 'LayoutDashboard',
    description: 'Overview and key metrics'
  },
  {
    id: 'students',
    label: 'Students',
    path: '/mentor/students',
    icon: 'Users',
    description: 'Manage assigned students'
  },
  {
    id: 'sessions',
    label: 'Sessions',
    path: '/mentor/sessions',
    icon: 'Calendar',
    description: 'Schedule and manage sessions'
  },
  {
    id: 'messages',
    label: 'Messages',
    path: '/mentor/messages',
    icon: 'MessageSquare',
    description: 'Communication with students'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/mentor/analytics',
    icon: 'BarChart3',
    description: 'Performance metrics and reports'
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/mentor/profile',
    icon: 'User',
    description: 'Manage your mentor profile'
  }
];

// Default Values
export const DEFAULTS = {
  MAX_STUDENTS: 10,
  SESSION_DURATION: 60, // minutes
  PAGINATION_SIZE: 10,
  NOTIFICATION_TIMEOUT: 5000, // milliseconds
  REFRESH_INTERVAL: 30000, // 30 seconds
};

// Date and Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  FULL: 'YYYY-MM-DD HH:mm:ss',
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  REQUIRED_MESSAGE: 'This field is required',
  EMAIL_MESSAGE: 'Please enter a valid email address',
  MIN_MESSAGE: (min) => `Minimum ${min} characters required`,
  MAX_MESSAGE: (max) => `Maximum ${max} characters allowed`,
};

export default {
  API_BASE_URL,
  MENTOR_API_BASE,
  MENTOR_ENDPOINTS,
  COLORS,
  SIZES,
  MENTOR_STATUS,
  ASSIGNMENT_STATUS,
  SESSION_STATUS,
  EXPERIENCE_LEVELS,
  PRIORITY_LEVELS,
  MENTOR_NAV_ITEMS,
  DEFAULTS,
  DATE_FORMATS,
  VALIDATION,
}; 