import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DevAuth from './DevAuth';

const LoginPage = () => {
  const { initiateGoogleLogin, isLoading, error } = useAuth();
  const [showFeatures, setShowFeatures] = useState(false);
  const [showDevAuth, setShowDevAuth] = useState(true); // Show dev auth by default

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <h1>Welcome to Happy Fox LMS</h1>
          <p>Your comprehensive Learning Management System</p>
        </div>

        {/* Development Authentication - Show first for testing */}
        {showDevAuth && (
          <div className="login-main">
            <div className="login-content">
              <DevAuth />
            </div>
          </div>
        )}

        {/* Toggle for switching between dev and Google auth */}
        <div className="auth-toggle">
          <button 
            className="toggle-auth-btn"
            onClick={() => setShowDevAuth(!showDevAuth)}
          >
            {showDevAuth ? 'Try Google OAuth' : 'Use Development Login'}
          </button>
        </div>

        {/* Main Login Section - Google OAuth */}
        {!showDevAuth && (
          <div className="login-main">
            <div className="login-content">
              <div className="login-form-section">
                <div className="login-form">
                  <h2>Sign In with Google</h2>
                  <p>Access your personalized learning dashboard</p>
                  
                  {error && (
                    <div className="error-alert">
                      <span className="error-icon">⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <button 
                    className="google-login-btn"
                    onClick={initiateGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                      <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28z"/>
                      <path fill="#EA4335" d="M8.98 3.54c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42c.45-1.36 1.7-2.88 4.48-2.88z"/>
                    </svg>
                    {isLoading ? 'Signing in...' : 'Continue with Google'}
                  </button>

                  <div className="login-info">
                    <p className="secure-note">
                      🔒 Secure authentication powered by Google
                    </p>
                  </div>
                </div>
              </div>

              <div className="login-features-section">
                <div className="features-showcase">
                  <h3>What's Inside</h3>
                  <div className="feature-list">
                    <div className="feature-item">
                      <div className="feature-icon">👑</div>
                      <div className="feature-content">
                        <h4>Admin Dashboard</h4>
                        <p>Manage courses, cohorts, teams, and user invitations</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon">🎓</div>
                      <div className="feature-content">
                        <h4>Mentor Portal</h4>
                        <p>Guide students, track progress, and conduct sessions</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon">📚</div>
                      <div className="feature-content">
                        <h4>Student Learning</h4>
                        <p>Access courses, connect with mentors, and track progress</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Toggle */}
        <div className="features-toggle">
          <button 
            className="toggle-btn"
            onClick={() => setShowFeatures(!showFeatures)}
          >
            {showFeatures ? 'Hide Features' : 'Learn More'}
          </button>
        </div>

        {/* Expanded Features */}
        {showFeatures && (
          <div className="expanded-features">
            <div className="features-grid">
              <div className="feature-card">
                <h4>🚀 Role-Based Access</h4>
                <p>Automatic role detection ensures you see only what's relevant to your responsibilities.</p>
              </div>
              <div className="feature-card">
                <h4>📊 Analytics & Insights</h4>
                <p>Comprehensive dashboards provide insights into learning progress and system usage.</p>
              </div>
              <div className="feature-card">
                <h4>💬 Communication Tools</h4>
                <p>Built-in messaging and session management for seamless mentor-student interaction.</p>
              </div>
              <div className="feature-card">
                <h4>🎯 Goal Tracking</h4>
                <p>Set, track, and achieve learning objectives with structured goal management.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="login-footer">
          <p>&copy; 2024 Happy Fox LMS. Empowering education through technology.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 