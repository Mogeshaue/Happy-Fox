import React, { useState } from 'react';

const SimpleStudentLogin = ({ onLoginSuccess, onLoginError }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  const handleTestLogin = async (e) => {
    e.preventDefault();
    
    if (!email) {
      onLoginError('Email is required');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/test/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          first_name: firstName,
          last_name: lastName
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        onLoginSuccess(data);
      } else {
        onLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      onLoginError(error.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h3>Test Student Login</h3>
      <form onSubmit={handleTestLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={isLoading || !email}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            opacity: isLoading || !email ? 0.6 : 1
          }}
        >
          {isLoading ? 'Logging in...' : 'Test Login'}
        </button>
      </form>
    </div>
  );
};

export default SimpleStudentLogin;
