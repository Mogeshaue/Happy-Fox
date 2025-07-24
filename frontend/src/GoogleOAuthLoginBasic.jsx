import React, { useEffect, useState } from 'react';

const GoogleOAuthLoginBasic = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '334942844947-dsh25hdm1ekhqq76f1cj15vls8ufvs2s.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    setLoading(true);
    setError('');
    
    try {
      // Send the credential to your backend
      const backendResponse = await fetch('http://127.0.0.1:8000/api/google-oauth-login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await backendResponse.json();
      
      if (backendResponse.ok) {
        setUser(data.user);
        console.log('Login successful:', data);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Network error during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google SDK not loaded');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setError('');
  };

  if (user) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
        <h3>Welcome, {user.first_name || user.email}!</h3>
        <p>Email: {user.email}</p>
        <p>Authentication: Google OAuth</p>
        <button 
          onClick={handleLogout}
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
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      {error && (
        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          Error: {error}
        </div>
      )}
      
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
        {loading ? (
          'Signing in...'
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28z"/>
              <path fill="#EA4335" d="M8.98 3.54c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42c.45-1.36 1.7-2.88 4.48-2.88z"/>
            </svg>
            Sign in with Google
          </>
        )}
      </button>
      
      <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
        Click to sign in with your Google account
      </p>
    </div>
  );
};

export default GoogleOAuthLoginBasic;
