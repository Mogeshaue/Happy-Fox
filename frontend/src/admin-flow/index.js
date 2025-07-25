/**
 * Admin Flow Module Index
 * Single Responsibility: Export main admin flow components and services
 * Following SOLID principles - provides a clean interface to the module
 */

// Main routing component
export { default as AdminFlowRoutes } from './AdminFlowRoutes.jsx';

// Layout components
export { default as AdminFlowLayout } from './layout/AdminFlowLayout.jsx';
export { default as AdminFlowSidebar } from './layout/AdminFlowSidebar.jsx';
export { default as AdminFlowNavbar } from './layout/AdminFlowNavbar.jsx';

// Page components
export { default as AdminFlowDashboard } from './pages/AdminFlowDashboard.jsx';
export { default as OrganizationManagement } from './pages/OrganizationManagement.jsx';
export { default as UserManagement } from './pages/UserManagement.jsx';
export { default as SystemConfiguration } from './pages/SystemConfiguration.jsx';

// Services
export { default as AdminFlowAPI } from './services/AdminFlowAPI.js';
export { default as OrganizationService } from './services/OrganizationService.js';
export { default as UserService } from './services/UserService.js';
export { default as SystemConfigService } from './services/SystemConfigService.js';

// Store
export { default as useAdminFlowStore } from './store/adminFlowStore.js';

// Constants
export * from './utils/constants.js';
