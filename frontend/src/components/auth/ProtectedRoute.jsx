import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginPage from './LoginPage';

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  fallback = null,
  redirectToAuth = false 
}) => {
  const { isAuthenticated, hasAnyRole, isLoading, error } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !isAuthenticated()) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Authentication Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    if (redirectToAuth) {
      return <LoginPage />;
    }
    return fallback || <UnauthorizedAccess message="Please log in to access this page." />;
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return fallback || <UnauthorizedAccess message="You don't have permission to access this page." />;
  }

  // Render the protected content
  return children;
};

const UnauthorizedAccess = ({ message }) => (
  <div className="unauthorized-container">
    <div className="unauthorized-content">
      <h2>Access Denied</h2>
      <p>{message}</p>
    </div>
  </div>
);

export default ProtectedRoute; 