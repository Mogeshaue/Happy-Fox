import React, { useState } from 'react'
import GoogleOAuthLoginBasic from './GoogleOAuthLoginBasic'
import SimpleStudentLoginBasic from './SimpleStudentLoginBasic'
import AdminDashboardBasic from './AdminDashboardBasic'
import './App.css'
import React from 'react'
import AdminRoute from './mainadmin/AdminRoute'
import MentorRoutes from './mentor/MentorRoutes.jsx'
import GoogleOAuthLogin from './GoogleOAuthLogin'
import SimpleStudentLogin from './SimpleStudentLogin'

function App() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('')
  const [echoInput, setEchoInput] = useState('')
  const [echoResponse, setEchoResponse] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [loginError, setLoginError] = useState('')

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
    <div>
      {/* Include both Admin and Mentor Routes */}
      <AdminRoute/>
      <MentorRoutes/>
    </div>
  )
}

export default App