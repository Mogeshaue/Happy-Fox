import React, { useState, useEffect } from 'react';
import './App.css';

// Import role-specific dashboards
import AdminDashboard from './dashboards/AdminDashboard';
import MentorDashboard from './dashboards/MentorDashboard'; 
import StudentDashboard from './dashboards/StudentDashboard';
import APIConnectionTest from './components/APIConnectionTest';

// Role selector component
const RoleSelector = ({ currentRole, onRoleChange }) => {
  return (
    <div className="role-selector">
      <h2>Select Your Role</h2>
      <div className="role-buttons">
        <button 
          className={currentRole === 'test' ? 'active' : ''}
          onClick={() => onRoleChange('test')}
        >
          🔗 API Test
        </button>
        <button 
          className={currentRole === 'admin' ? 'active' : ''}
          onClick={() => onRoleChange('admin')}
        >
          👑 Admin
        </button>
        <button 
          className={currentRole === 'mentor' ? 'active' : ''}
          onClick={() => onRoleChange('mentor')}
        >
          🎓 Mentor
        </button>
        <button 
          className={currentRole === 'student' ? 'active' : ''}
          onClick={() => onRoleChange('student')}
        >
          📚 Student
        </button>
      </div>
    </div>
  );
};

function App() {
  const [currentRole, setCurrentRole] = useState('test');

  const renderDashboard = () => {
    switch(currentRole) {
      case 'test':
        return <APIConnectionTest />;
      case 'admin':
        return <AdminDashboard />;
      case 'mentor':
        return <MentorDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return <APIConnectionTest />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🦊 Happy Fox LMS - Testing Interface</h1>
        <RoleSelector currentRole={currentRole} onRoleChange={setCurrentRole} />
      </header>
      
      <main className="app-main">
        {renderDashboard()}
      </main>
    </div>
  );
}

export default App;