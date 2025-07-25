import React, { useState, useEffect } from 'react';

const MentorDashboard = () => {
  const [mentorProfiles, setMentorProfiles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_BASE = 'http://localhost:8000';

  // API functions
  const fetchData = async (endpoint) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}${endpoint}`);
      const data = await response.json();
      setMessage(`✅ Fetched from ${endpoint}`);
      return data;
    } catch (error) {
      setMessage(`❌ Error fetching ${endpoint}: ${error.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const postData = async (endpoint, data) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      setMessage(`✅ Posted to ${endpoint}`);
      return result;
    } catch (error) {
      setMessage(`❌ Error posting to ${endpoint}: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load data functions
  const loadMentorProfiles = async () => {
    const data = await fetchData('/mentor/api/mentor-profiles/');
    if (data) setMentorProfiles(Array.isArray(data) ? data : []);
  };

  const loadAssignments = async () => {
    const data = await fetchData('/mentor/api/assignments/');
    if (data) setAssignments(Array.isArray(data) ? data : []);
  };

  const loadSessions = async () => {
    const data = await fetchData('/mentor/api/sessions/');
    if (data) setSessions(Array.isArray(data) ? data : []);
  };

  const loadMessages = async () => {
    const data = await fetchData('/mentor/api/messages/');
    if (data) setMessages(Array.isArray(data) ? data : []);
  };

  // Create test data functions
  const createMentorProfile = async () => {
    const profileData = {
      user_id: 1, // Mock user ID
      bio: 'Test mentor profile created from dashboard',
      expertise_areas: ['JavaScript', 'React', 'Node.js'],
      experience_level: 'senior',
      hourly_rate: 50.00,
      availability_schedule: {
        'monday': ['09:00-17:00'],
        'tuesday': ['09:00-17:00'],
        'wednesday': ['09:00-17:00'],
        'thursday': ['09:00-17:00'],
        'friday': ['09:00-17:00']
      },
      preferred_communication: ['video_call', 'chat'],
      status: 'active'
    };
    const result = await postData('/mentor/api/mentor-profiles/create/', profileData);
    if (result) loadMentorProfiles();
  };

  const createTestSession = async () => {
    const sessionData = {
      mentorship_assignment_id: 1, // Mock assignment ID
      session_type: 'video_call',
      scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 60,
      topic: 'React Development Session',
      status: 'scheduled'
    };
    const result = await postData('/mentor/api/sessions/', sessionData);
    if (result) loadSessions();
  };

  return (
    <div className="dashboard">
      <h2>🎓 Mentor Dashboard</h2>
      
      {loading && <div className="loading">Loading...</div>}
      {message && <div className="message">{message}</div>}

      <div className="dashboard-grid">
        {/* Mentor Profiles Section */}
        <div className="dashboard-card">
          <h3>👨‍🏫 Mentor Profiles</h3>
          <button onClick={loadMentorProfiles}>Load Mentor Profiles</button>
          <button onClick={createMentorProfile}>Create Test Profile</button>
          <div className="data-list">
            {mentorProfiles.length > 0 ? (
              mentorProfiles.map((profile, index) => (
                <div key={index} className="data-item">
                  <strong>Profile #{index + 1}</strong>
                  <br />
                  <small>Experience: {profile.experience_level}</small>
                  <br />
                  <small>Rate: ${profile.hourly_rate}/hr</small>
                </div>
              ))
            ) : (
              <div>No mentor profiles found</div>
            )}
          </div>
        </div>

        {/* Mentorship Assignments Section */}
        <div className="dashboard-card">
          <h3>📋 Assignments</h3>
          <button onClick={loadAssignments}>Load Assignments</button>
          <div className="data-list">
            {assignments.length > 0 ? (
              assignments.map((assignment, index) => (
                <div key={index} className="data-item">
                  <strong>Assignment #{index + 1}</strong>
                  <br />
                  <small>Status: {assignment.status}</small>
                </div>
              ))
            ) : (
              <div>No assignments found</div>
            )}
          </div>
        </div>

        {/* Mentor Sessions Section */}
        <div className="dashboard-card">
          <h3>💬 Sessions</h3>
          <button onClick={loadSessions}>Load Sessions</button>
          <button onClick={createTestSession}>Create Test Session</button>
          <div className="data-list">
            {sessions.length > 0 ? (
              sessions.map((session, index) => (
                <div key={index} className="data-item">
                  <strong>{session.topic}</strong>
                  <br />
                  <small>Type: {session.session_type}</small>
                  <br />
                  <small>Duration: {session.duration_minutes} minutes</small>
                </div>
              ))
            ) : (
              <div>No sessions found</div>
            )}
          </div>
        </div>

        {/* Messages Section */}
        <div className="dashboard-card">
          <h3>✉️ Messages</h3>
          <button onClick={loadMessages}>Load Messages</button>
          <div className="data-list">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div key={index} className="data-item">
                  <strong>Message #{index + 1}</strong>
                  <br />
                  <small>{msg.content || 'No content'}</small>
                </div>
              ))
            ) : (
              <div>No messages found</div>
            )}
          </div>
        </div>

        {/* Mentor Tools Section */}
        <div className="dashboard-card">
          <h3>🛠️ Mentor Tools</h3>
          <button onClick={() => fetchData('/mentor/api/mentor-profiles/me/')}>
            My Profile
          </button>
          <button onClick={() => fetchData('/mentor/api/assignments/')}>
            My Assignments
          </button>
          <button onClick={() => fetchData('/mentor/api/sessions/')}>
            Upcoming Sessions
          </button>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h3>⚡ Quick Actions</h3>
          <button onClick={() => setMessage('📅 Schedule new session feature coming soon!')}>
            Schedule Session
          </button>
          <button onClick={() => setMessage('📝 Send message feature coming soon!')}>
            Send Message
          </button>
          <button onClick={() => setMessage('📊 View analytics feature coming soon!')}>
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
