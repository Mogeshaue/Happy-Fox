import React, { useState, useEffect } from 'react';

const SimpleGoogleAuth = ({ onLoginSuccess, onLoginError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const GOOGLE_CLIENT_ID = '969085485835-loqiaoo05j21ibqd6evgobca07cj0ror.apps.googleusercontent.com';

  useEffect(() => {
    // Load Google platform library
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/platform.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Also add meta tag for Google Sign-In
    const meta = document.createElement('meta');
    meta.name = 'google-signin-client_id';
    meta.content = GOOGLE_CLIENT_ID;
    document.head.appendChild(meta);

    return () => {
      // Cleanup
      document.body.removeChild(script);
      document.head.removeChild(meta);
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    try {
      console.log('Google response received:', response);
      
      const backendResponse = await fetch('http://127.0.0.1:8000/api/auth/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await backendResponse.json();
      
      if (backendResponse.ok) {
        onLoginSuccess(data);
      } else {
        onLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      onLoginError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const openGooglePopup = () => {
    setIsLoading(true);
    
    // Create Google OAuth URL
    const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
      `response_type=token&` +
      `scope=email profile openid`;

    // Open popup
    const popup = window.open(
      googleAuthUrl,
      'google-auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // Listen for popup close
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setIsLoading(false);
        onLoginError('Authentication window was closed');
      }
    }, 1000);

    // Listen for auth complete (you'd need to handle the redirect properly)
    window.addEventListener('message', (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        clearInterval(checkClosed);
        popup.close();
        handleGoogleResponse(event.data.response);
      }
    });
  };

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <button
        onClick={openGooglePopup}
        disabled={isLoading}
        style={{
          backgroundColor: '#db4437',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0 auto',
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          'Opening Google...'
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-2.7.75 4.8 4.8 0 0 1-4.52-3.3H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.46 10.47a4.8 4.8 0 0 1 0-3.07V5.33H1.83a8 8 0 0 0 0 7.21l2.63-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.72c1.16 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.33L4.46 7.4A4.77 4.77 0 0 1 8.98 4.72z"/>
            </svg>
            Google Popup Login
          </>
        )}
      </button>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
        Alternative Google login method
      </div>
    </div>
  );
};

export default SimpleGoogleAuth;
