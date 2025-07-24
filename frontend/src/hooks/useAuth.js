import { useState, useEffect } from 'react';

// Custom hook for authentication state - Single Responsibility
export const useAuth = (authService) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((user) => {
      setUser(user);
    });

    // Initialize with current user
    setUser(authService.getCurrentUser());

    return unsubscribe;
  }, [authService]);

  const login = async (loginFunction) => {
    setLoading(true);
    setError('');
    
    try {
      await loginFunction();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setError('');
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated()
  };
};
