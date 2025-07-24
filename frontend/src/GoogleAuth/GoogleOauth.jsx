import React, { useEffect } from 'react';
import useCourseStore from '../store/Adminstors';

const GOOGLE_CLIENT_ID = '305743130332-tsr28ldgeeadlrgr7udg816o0ll8iean.apps.googleusercontent.com';

const GoogleOauth = ({ onLoginSuccess, onLoginError }) => {
  const { setAuthUser } = useCourseStore(); // ✅ Fix: Correct destructuring from Zustand store

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large' }
      );
    };

    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }

    function handleCredentialResponse(response) {
      fetch('http://127.0.0.1:8000/api/auth/google/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.student) {
            setAuthUser(data.student); // ✅ Save user data in Zustand store
            onLoginSuccess(data);
          } else {
            onLoginError(data.error || 'Login failed');
          }
        })
        .catch(err => {
          onLoginError(err.message || 'Login failed');
        });
    }
  }, [onLoginSuccess, onLoginError, setAuthUser]);

  return <div id="google-signin-button"></div>;
};

export default GoogleOauth;
