import React from 'react';

// Error Display Component - Single Responsibility for error display
const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div style={{
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '12px 20px',
      border: '1px solid #f5c6cb',
      borderRadius: '6px',
      margin: '10px 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      {error}
      {onDismiss && (
        <button 
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#721c24',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '10px'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

// Loading Component - Single Responsibility for loading state
const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div style={{
    textAlign: 'center',
    padding: '20px',
    color: '#007bff',
    fontWeight: 'bold'
  }}>
    {message}
  </div>
);

// User Display Component - Single Responsibility for user information
const UserDisplay = ({ user, onLogout }) => (
  <div style={{
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa',
    margin: '10px 0'
  }}>
    <h3>Welcome, {user.first_name || user.email}!</h3>
    <p><strong>Email:</strong> {user.email}</p>
    <p><strong>Method:</strong> {user.method || 'Google OAuth'}</p>
    <p><strong>Status:</strong> ✅ Authenticated</p>
    <button 
      onClick={onLogout}
      style={{
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Logout
    </button>
  </div>
);

export { ErrorDisplay, LoadingSpinner, UserDisplay };
