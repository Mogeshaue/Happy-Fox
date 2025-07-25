import React from 'react'

const StudentNav = ({ setActiveView }) => {
  return (
    <nav className="main-nav">
      <button 
        className="nav-btn" 
        onClick={() => setActiveView('home')}
      >
        Home
      </button>
      <button 
        className="nav-btn" 
        onClick={() => setActiveView('login')}
      >
        Student Login
      </button>
    </nav>
  )
}

export default StudentNav