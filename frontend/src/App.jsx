import React, { useState } from 'react'
import GoogleOAuthLoginBasic from './GoogleOAuthLoginBasic'
import SimpleStudentLoginBasic from './SimpleStudentLoginBasic'
import AdminDashboardBasic from './AdminDashboardBasic'
import './App.css'
import StudentRoute from './Studentsdashboard/Studentsroute'
import Welcome from './Welcome/Welcome'
import Mroute from './mentor/Mroute'

import useCourseStore from './store/Adminstors'

// import useCourseStore from './store/Adminstors'


const App = () => {
  const [activeView, setActiveView] = useState('home')

  const renderContent = () => {
    switch(activeView) {
      case 'admin':
        return <AdminDashboardBasic />
      case 'login':
        return (
          <div className="login-section">
            <h2>Student Login Options</h2>
            
            {/* Google OAuth Login */}
            <div className="login-option">
              <h3>Google OAuth Login</h3>
              <GoogleOAuthLoginBasic />
            </div>
            
            {/* Simple Test Login */}
            <div className="login-option">
              <h3>Simple Test Login</h3>
              <SimpleStudentLoginBasic />
            </div>
          </div>
        )
      default:
        return (
          <div className="home-section">
            <h1>Happy Fox LMS</h1>
            <p>Welcome to the Learning Management System</p>
            <p>Use the navigation above to access different features:</p>
            <ul>
              <li><strong>Student Login:</strong> Test authentication functionality</li>
              <li><strong>Admin Dashboard:</strong> Manage courses, cohorts, teams, and invitations</li>
            </ul>
          </div>
        )
    }
  }

  const {authUser} =useCourseStore()
  console.log(authUser)

  return (
    <div className="app">
      <nav className="main-nav">
        <button 
          className={activeView === 'home' ? 'active' : ''} 
          onClick={() => setActiveView('home')}
        >
          Home
        </button>
        <button 
          className={activeView === 'login' ? 'active' : ''} 
          onClick={() => setActiveView('login')}
        >
          Student Login
        </button>
        <button 
          className={activeView === 'admin' ? 'active' : ''} 
          onClick={() => setActiveView('admin')}
        >
          Admin Dashboard
        </button>
      </nav>
      
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App