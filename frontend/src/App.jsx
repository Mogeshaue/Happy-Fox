import React, { useState } from 'react'
import GoogleOAuthLoginBasic from './GoogleOAuthLoginBasic'
import SimpleStudentLoginBasic from './SimpleStudentLoginBasic'
import AdminDashboardBasic from './AdminDashboardBasic'
import './App.css'
import React from 'react'
import AdminRoute from './mainadmin/AdminRoute'
import MentorRoutes from './mentor/MentorRoutes.jsx'
import MentorRoutes from './mentor/MentorRoutes.jsx'
import Welcome from './Welcome/Welcome'
import Mroute from './mentor/Mroute'
import HomeNav from './components/HomeNav'
import StudentNav from './components/StudentNav'
import AdminNav from './components/AdminNav'
import MentorNav from './components/MentorNav'

import useCourseStore from './store/Adminstors'

const App = () => {
  let  [activeView, setActiveView] = useState('home')

  activeView = "mentor"
  const renderContent = () => {
    switch(activeView) {
      case 'admin':
        return (
          <>
            <AdminNav setActiveView={setActiveView} />
            <AdminDashboardBasic />
          </>
        )
      case 'login':
        return (
          <>
            <StudentNav setActiveView={setActiveView} />
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
          </>
        )
      case 'mentor':
        return (
          <>
            <MentorNav setActiveView={setActiveView} />
            <MentorRoutes />
          </>
        )
      default:
        return (
          <>
            <HomeNav setActiveView={setActiveView} />
            <div className="home-section">
              <h1>Happy Fox LMS</h1>
              <p>Welcome to the Learning Management System</p>
            </div>
          </>
        )
    }
  }

  const {authUser} = useCourseStore()
  console.log(authUser)

  return (
    <div className="app">
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App