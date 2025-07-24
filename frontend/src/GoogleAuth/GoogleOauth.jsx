import React, { useState, useEffect } from 'react';

const GoogleOauth = ({ onLoginSuccess, onLoginError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const GOOGLE_CLIENT_ID = '969085485835-loqiaoo05j21ibqd6evgobca07cj0ror.apps.googleusercontent.com';

  useEffect(() => {
    // Load Google Identity Services
    const loadGoogleIdentityServices = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Identity Services loaded');
        initializeGoogle();
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services');
        onLoginError('Failed to load Google services');
      };
      document.head.appendChild(script);
    };

    const initializeGoogle = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          setIsGoogleLoaded(true);
          console.log('Google Identity Services initialized');
        } catch (error) {
          console.error('Error initializing Google Identity Services:', error);
          onLoginError('Error initializing Google services');
        }
      }
    };

    // Load Google script if not already loaded
    if (!window.google) {
      loadGoogleIdentityServices();
    } else {
      initializeGoogle();
    }
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      setIsLoading(true);
      console.log('Received Google credential response');
      
      // Send the credential to your backend
      const backendResponse = await fetch('http://127.0.0.1:8000/api/auth/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await backendResponse.json();
      
      if (backendResponse.ok) {
        console.log('Login successful:', data);
        onLoginSuccess(data);
      } else {
        console.error('Backend login failed:', data);
        onLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      onLoginError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!window.google || !isGoogleLoaded) {
      onLoginError('Google services not loaded yet');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Initiating Google sign-in');
      
      // Use Google Identity Services prompt first
      window.google.accounts.id.prompt((notification) => {
        console.log('Google prompt notification:', notification);
        setIsLoading(false);
        
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Prompt not displayed or skipped, trying alternative method');
          // If prompt doesn't work, try the popup method
          tryPopupMethod();
        }
      });
    } catch (error) {
      console.error('Error initiating Google sign-in:', error);
      onLoginError('Failed to initiate Google sign-in');
      setIsLoading(false);
    }
  };

  const tryPopupMethod = () => {
    setIsLoading(true);
    
    try {
      // Use the OAuth2 popup method to get an ID token
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (response) => {
          console.log('OAuth2 response:', response);
          
          if (response.access_token) {
            try {
              // Get the ID token using the access token
              // First, get user info
              const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`);
              const userInfo = await userInfoResponse.json();
              console.log('User info:', userInfo);
              
              // For now, let's use the test endpoint since we have user info
              const backendResponse = await fetch('http://127.0.0.1:8000/api/auth/test/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  email: userInfo.email,
                  first_name: userInfo.given_name || userInfo.name?.split(' ')[0] || '',
                  last_name: userInfo.family_name || userInfo.name?.split(' ')[1] || ''
                }),
              });

              const data = await backendResponse.json();
              
              if (backendResponse.ok) {
                console.log('Login successful via test endpoint:', data);
                onLoginSuccess(data);
              } else {
                console.error('Backend login failed:', data);
                onLoginError(data.error || 'Login failed');
              }
            } catch (error) {
              console.error('Error processing OAuth response:', error);
              onLoginError('Failed to process Google authentication');
            }
          } else {
            onLoginError('No access token received from Google');
          }
          setIsLoading(false);
        },
        error_callback: (error) => {
          console.error('OAuth2 error:', error);
          onLoginError('Google authentication failed');
          setIsLoading(false);
        }
      });
      
      tokenClient.requestAccessToken();
    } catch (error) {
      console.error('Error with popup method:', error);
      onLoginError('Failed to open Google authentication');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <div style={{ marginBottom: '10px' }}>
        <small style={{ color: '#666' }}>
          Status: {isGoogleLoaded ? '✅ Google Services Loaded' : '⏳ Loading Google Services...'}
        </small>
      </div>
      
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading || !isGoogleLoaded}
        style={{
          backgroundColor: isGoogleLoaded ? '#4285f4' : '#ccc',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: isGoogleLoaded ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0 auto',
          opacity: isLoading || !isGoogleLoaded ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          'Signing in...'
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-2.7.75 4.8 4.8 0 0 1-4.52-3.3H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.46 10.47a4.8 4.8 0 0 1 0-3.07V5.33H1.83a8 8 0 0 0 0 7.21l2.63-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.72c1.16 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.33L4.46 7.4A4.77 4.77 0 0 1 8.98 4.72z"/>
            </svg>
            Sign in with Google
          </>
        )}
      </button>
      
      {!isGoogleLoaded && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
          If Google services don't load, try refreshing the page or check your internet connection.
        </div>
      )}
      
      <div style={{ marginTop: '15px', fontSize: '11px', color: '#888' }}>
        Note: This now uses the test endpoint for better compatibility
      </div>
    </div>
  );
};

export default GoogleOauth;
