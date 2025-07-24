import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const DevAuth = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  const handleDevLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/dev-bypass/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || `${selectedRole}@test.com`,
          role: selectedRole,
          first_name: firstName || `Test ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`,
          last_name: lastName || 'User',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store auth data
        const authData = {
          user: data.user,
          roles: data.roles,
          primary_role: data.primary_role,
          role_details: data.role_details,
        };
        localStorage.setItem('auth_data', JSON.stringify(authData));
        
        // Store auth token for mentor app compatibility
        // Generate a simple token for development use
        const devToken = `dev_token_${data.user.id}_${Date.now()}`;
        localStorage.setItem('auth_token', devToken);
        
        // Also store user data in the format mentor app might expect
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        // Trigger page reload to activate authentication
        window.location.reload();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Network error during authentication');
      console.error('Dev auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (role) => {
    setSelectedRole(role);
    setEmail(`${role}@test.com`);
    setFirstName(`Test ${role.charAt(0).toUpperCase() + role.slice(1)}`);
    setLastName('User');
  };

  return (
    <div className="dev-auth-container">
      <div className="dev-auth-header">
        <h3>🚀 Development Authentication</h3>
        <p>Quick login for testing different user roles</p>
      </div>

      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="quick-login-buttons">
        <button 
          className="quick-btn admin-btn"
          onClick={() => quickLogin('admin')}
          disabled={isLoading}
        >
          👑 Login as Admin
        </button>
        <button 
          className="quick-btn mentor-btn"
          onClick={() => quickLogin('mentor')}
          disabled={isLoading}
        >
          🎓 Login as Mentor
        </button>
        <button 
          className="quick-btn student-btn"
          onClick={() => quickLogin('student')}
          disabled={isLoading}
        >
          📚 Login as Student
        </button>
      </div>

      <div className="dev-auth-divider">
        <span>or customize your test user</span>
      </div>

      <form onSubmit={handleDevLogin} className="dev-auth-form">
        <div className="form-group">
          <label>Role:</label>
          <select 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={isLoading}
          >
            <option value="admin">Admin</option>
            <option value="mentor">Mentor</option>
            <option value="student">Student</option>
          </select>
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`${selectedRole}@test.com`}
            disabled={isLoading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Test"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="User"
              disabled={isLoading}
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="dev-login-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
        </button>
      </form>

      <div className="dev-auth-note">
        <p>⚠️ This is for development only. Remove in production.</p>
      </div>
    </div>
  );
};

export default DevAuth; 