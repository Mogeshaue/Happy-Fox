import React from 'react'

const MentorNav = ({ setActiveView }) => {
  return (
    <nav className="main-nav">
      <button 
        className="nav-btn" 
        onClick={() => setActiveView('home')}
      >
        Home
      </button>
    </nav>
  )
}

export default MentorNav