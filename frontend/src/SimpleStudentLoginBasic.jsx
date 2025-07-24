import React, { useState } from 'react';

const SimpleStudentLogin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTestLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Test with a simple endpoint
      const response = await fetch('http://127.0.0.1:8000/api/test-student-login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          method: 'simple_test'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user || { email: 'test@example.com', method: 'Simple Test' });
        console.log('Test login successful:', data);
      } else {
        setError(data.error || 'Test login failed');
      }
    } catch (error) {
      console.error('Error during test login:', error);
      setError('Network error during test login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setError('');
  };

  if (user) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
        <h3>Test Login Successful!</h3>
        <p>Email: {user.email}</p>
        <p>Method: {user.method || 'Simple Test'}</p>
        <p>Status: ✅ Connected to Backend</p>
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
        onClick={handleTestLogin}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          width: '100%'
        }}
      >
        {loading ? 'Testing Connection...' : 'Test Backend Connection'}
      </button>
      
      <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
        Simple test to verify backend connectivity
      </p>
    </div>
  );
};

export default SimpleStudentLogin;
