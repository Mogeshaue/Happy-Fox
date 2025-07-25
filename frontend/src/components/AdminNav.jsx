import React from 'react'

const AdminNav = ({ setActiveView }) => {
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
        onClick={() => setActiveView('admin')}
      >
        Admin Dashboard
      </button>
    </nav>
  )
}

export default AdminNav