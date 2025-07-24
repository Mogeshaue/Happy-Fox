import React, { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { authService } from './services/AuthService';
import { googleSDKService } from './services/GoogleSDKService';
import { ErrorDisplay, LoadingSpinner, UserDisplay } from './components/common/CommonComponents';

// Google OAuth Component - Single Responsibility for Google authentication
const GoogleOAuthLogin = () => {
  const { user, loading, error, login, logout } = useAuth(authService);

  useEffect(() => {
    const initializeGoogle = async () => {
      try {
        await googleSDKService.loadSDK();
        
        // Set up credential response handler
        googleSDKService.onCredentialResponse(async (response) => {
          await login(() => authService.googleLogin(response.credential));
        });
      } catch (error) {
        console.error('Failed to initialize Google SDK:', error);
      }
    };

    initializeGoogle();

    return () => {
      googleSDKService.cleanup();
    };
  }, [login]);

  const handleGoogleLogin = async () => {
    try {
      googleSDKService.prompt();
    } catch (error) {
      await login(() => Promise.reject(new Error('Google SDK not loaded')));
    }
  };

  if (user) {
    return <UserDisplay user={user} onLogout={logout} />;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <ErrorDisplay error={error} />
      
      {loading && <LoadingSpinner message="Signing in..." />}
      
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0 auto'
        }}
      >
        {!loading && (
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28z"/>
            <path fill="#EA4335" d="M8.98 3.54c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42c.45-1.36 1.7-2.88 4.48-2.88z"/>
          </svg>
        )}
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      
      <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
        Click to sign in with your Google account
      </p>
    </div>
  );
};

export default GoogleOAuthLogin;
