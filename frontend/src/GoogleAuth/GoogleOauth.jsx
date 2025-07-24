import React, { useState, useEffect } from 'react';

const GoogleOauth = ({ onLoginSuccess, onLoginError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const GOOGLE_CLIENT_ID = '969085485835-loqiaoo05j21ibqd6evgobca07cj0ror.apps.googleusercontent.com';

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleLoaded(true);
      };
      script.onerror = () => {
        onLoginError('Failed to load Google services');
      };
      document.head.appendChild(script);
    };

    if (!window.google) {
      loadGoogleScript();
    } else {
      setIsGoogleLoaded(true);
    }
  }, []);

  const handleGoogleLogin = () => {
    if (!window.google || !isGoogleLoaded) {
      onLoginError('Google services not loaded');
      return;
    }

    setIsLoading(true);

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile openid',
      response_type: 'id_token',
      callback: async (response) => {
        const idToken = response.id_token;

        if (!idToken) {
          onLoginError('No ID token received');
          setIsLoading(false);
          return;
        }

        try {
          const res = await fetch('http://127.0.0.1:8000/api/auth/google/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: idToken }),
          });

          const data = await res.json();

          if (res.ok) {
            alert('✅ Login successful!');
            onLoginSuccess(data);
          } else {
            onLoginError(data.error || 'Login failed');
          }
        } catch (err) {
          onLoginError(err.message || 'Google login failed');
        } finally {
          setIsLoading(false);
        }
      },
      error_callback: (err) => {
        onLoginError('Google login failed');
        setIsLoading(false);
      }
    });

    tokenClient.requestAccessToken();
  };

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading || !isGoogleLoaded}
        style={{
          backgroundColor: '#4285f4',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: isGoogleLoaded ? 'pointer' : 'not-allowed',
          opacity: isLoading ? 0.6 : 1
        }}
      >
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </button>
    </div>
  );
};

export default GoogleOauth;
