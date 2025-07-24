import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [primaryRole, setPrimaryRole] = useState(null);
  const [roleDetails, setRoleDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Google Client ID - Update this if you create a new OAuth Client ID
  const GOOGLE_CLIENT_ID = '305743130332-tsr28ldgeeadlrgr7udg816o0ll8iean.apps.googleusercontent.com';
  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Initialize Google SDK
  useEffect(() => {
    const initializeGoogleSDK = () => {
      if (window.google) {
        console.log('✅ Google SDK already loaded, initializing...');
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        console.log('✅ Google SDK initialized with Client ID:', GOOGLE_CLIENT_ID);
        setIsLoading(false);
      } else {
        console.log('📦 Loading Google SDK...');
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (window.google) {
            console.log('✅ Google SDK loaded successfully, initializing...');
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: handleGoogleResponse,
            });
            console.log('✅ Google SDK initialized with Client ID:', GOOGLE_CLIENT_ID);
          }
          setIsLoading(false);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Google SDK');
          setError('Failed to load Google SDK');
          setIsLoading(false);
        };
        document.head.appendChild(script);
      }
    };

    // Check for stored authentication
    const storedAuth = localStorage.getItem('auth_data');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setUser(authData.user);
        setRoles(authData.roles);
        setPrimaryRole(authData.primary_role);
        setRoleDetails(authData.role_details);
        
        // Ensure auth_token is available for mentor app
        if (!localStorage.getItem('auth_token')) {
          // Generate a token if missing (for backward compatibility)
          const fallbackToken = `stored_token_${authData.user.id}_${Date.now()}`;
          localStorage.setItem('auth_token', fallbackToken);
        }
        
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        localStorage.removeItem('auth_data');
      }
    }

    initializeGoogleSDK();
  }, []);

  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    setError(null);

    // Debug logging
    console.log('🔍 Current origin:', window.location.origin);
    console.log('🔍 Google Client ID:', GOOGLE_CLIENT_ID);
    console.log('🔍 Authentication attempt starting...');

    try {
      const backendResponse = await fetch(`${API_BASE_URL}/auth/google/enhanced/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await backendResponse.json();

      if (data.success) {
        console.log('✅ Authentication successful:', data);
        const authData = {
          user: data.user,
          roles: data.roles,
          primary_role: data.primary_role,
          role_details: data.role_details,
        };

        setUser(data.user);
        setRoles(data.roles);
        setPrimaryRole(data.primary_role);
        setRoleDetails(data.role_details);

        // Store auth data
        localStorage.setItem('auth_data', JSON.stringify(authData));
        
        // Store auth token for mentor app compatibility
        // Using the Google credential token as the auth token
        localStorage.setItem('auth_token', response.credential);
        
        // Also store user data in the format mentor app might expect
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
      } else {
        console.error('❌ Authentication failed:', data);
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('❌ Network error during authentication:', error);
      setError('Network error during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const initiateGoogleLogin = () => {
    console.log('🚀 Initiating Google login...');
    console.log('🔍 Current origin:', window.location.origin);
    console.log('🔍 Expected origins in Google Console: http://localhost:5173, http://127.0.0.1:5173');
    
    if (window.google) {
      console.log('✅ Google SDK loaded, prompting for login...');
      window.google.accounts.id.prompt();
    } else {
      console.error('❌ Google SDK not loaded');
      setError('Google SDK not loaded');
    }
  };

  const logout = () => {
    setUser(null);
    setRoles([]);
    setPrimaryRole(null);
    setRoleDetails({});
    setError(null);
    
    // Clear all stored authentication data
    localStorage.removeItem('auth_data');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  };

  const hasRole = (role) => {
    return roles.includes(role);
  };

  const hasAnyRole = (roleList) => {
    return roleList.some(role => roles.includes(role));
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.email;
  };

  const value = {
    // Auth state
    user,
    roles,
    primaryRole,
    roleDetails,
    isLoading,
    error,
    
    // Auth actions
    initiateGoogleLogin,
    logout,
    
    // Auth checks
    isAuthenticated,
    hasRole,
    hasAnyRole,
    
    // Utility
    getUserDisplayName,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 