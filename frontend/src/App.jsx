import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import RoleBasedRouter from './components/auth/RoleBasedRouter';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';
import './components/auth/auth.css';

const App = () => {
  return (
    <AuthProvider>
      <div className="app">
        <AppContent />
      </div>
    </AuthProvider>
  );
};

const AppContent = () => {
  return (
    <div className="app-content">
      <RoleBasedRouter />
    </div>
  );
};

export default App;