import React from 'react'

const HomeNav = ({ setActiveView }) => {
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
      <button 
        className="nav-btn" 
        onClick={() => setActiveView('admin')}
      >
        Admin Dashboard
      </button>
    </nav>
  )
}

export default HomeNav