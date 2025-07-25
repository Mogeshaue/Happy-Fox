import React, { useState, useEffect } from 'react';

const APIConnectionTest = () => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [testResults, setTestResults] = useState([]);

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    const tests = [
      { name: 'Basic API', endpoint: '/admin/api/hello/' },
      { name: 'Echo Test', endpoint: '/admin/api/echo/' },
      { name: 'Data Test', endpoint: '/admin/api/data/' },
      { name: 'Students List', endpoint: '/admin/api/students/' },
      { name: 'Admin Courses', endpoint: '/admin/api/admin/courses/' },
      { name: 'Student Flow Profile', endpoint: '/admin/student-flow/api/profile/' },
      { name: 'Mentor Profiles', endpoint: '/admin/mentor/api/mentor-profiles/' },
      { name: 'Admin Dashboard', endpoint: '/admin/admin-flow/api/dashboard/' },
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name} - ${API_BASE}${test.endpoint}`);
        const response = await fetch(`${API_BASE}${test.endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const status = response.status;
        const statusText = response.statusText;
        
        results.push({
          name: test.name,
          endpoint: test.endpoint,
          status: status,
          statusText: statusText,
          success: status >= 200 && status < 400,
          timestamp: new Date().toLocaleTimeString()
        });
      } catch (error) {
        results.push({
          name: test.name,
          endpoint: test.endpoint,
          status: 'ERROR',
          statusText: error.message,
          success: false,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }

    setTestResults(results);
    const successCount = results.filter(r => r.success).length;
    setBackendStatus(successCount > 0 ? 'connected' : 'failed');
  };

  const getStatusColor = (success) => {
    return success ? '#10b981' : '#ef4444';
  };

  const getStatusIcon = (success) => {
    return success ? '✅' : '❌';
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔗 Backend Connection Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Backend Status: </strong>
        <span style={{ 
          color: backendStatus === 'connected' ? '#10b981' : '#ef4444',
          fontWeight: 'bold'
        }}>
          {backendStatus === 'checking' ? '🔄 Checking...' : 
           backendStatus === 'connected' ? '🟢 Connected' : '🔴 Failed'}
        </span>
      </div>

      <button 
        onClick={testBackendConnection}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        🔄 Retest Connection
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3>📊 Test Results</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {testResults.map((result, index) => (
            <div 
              key={index} 
              style={{
                padding: '12px',
                border: `2px solid ${getStatusColor(result.success)}`,
                borderRadius: '8px',
                backgroundColor: result.success ? '#f0fdf4' : '#fef2f2'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{getStatusIcon(result.success)} {result.name}</strong>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {result.endpoint}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: getStatusColor(result.success) }}>
                    {result.status}
                  </div>
                  <div style={{ fontSize: '10px', color: '#888' }}>
                    {result.timestamp}
                  </div>
                </div>
              </div>
              {result.statusText && (
                <div style={{ fontSize: '12px', color: '#555', marginTop: '8px' }}>
                  {result.statusText}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h4>🚀 Quick Start Instructions</h4>
        <ol style={{ margin: 0 }}>
          <li>Start Django backend: <code>cd backend/base_app && python manage.py runserver</code></li>
          <li>Start React frontend: <code>cd frontend && npm run dev</code></li>
          <li>Open browser: <code>http://localhost:5173</code></li>
          <li>Test the API connections above</li>
        </ol>
      </div>
    </div>
  );
};

export default APIConnectionTest;
