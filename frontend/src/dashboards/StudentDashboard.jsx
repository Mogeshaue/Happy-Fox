import React, { useState, useEffect } from 'react';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [learningGoals, setLearningGoals] = useState([]);
  const [resources, setResources] = useState([]);
  const [progress, setProgress] = useState(null);
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
  const loadProfile = async () => {
    const data = await fetchData('/student-flow/api/profile/');
    if (data) setProfile(data);
  };

  const loadDashboard = async () => {
    const data = await fetchData('/student-flow/api/dashboard/');
    if (data) setMessage('📊 Dashboard data loaded');
  };

  const loadProgress = async () => {
    const data = await fetchData('/student-flow/api/progress/');
    if (data) setProgress(data);
  };

  const loadEnrollments = async () => {
    const data = await fetchData('/student-flow/api/enrollments/');
    if (data) setEnrollments(Array.isArray(data) ? data : []);
  };

  const loadAssignments = async () => {
    const data = await fetchData('/student-flow/api/assignments/');
    if (data) setAssignments(Array.isArray(data) ? data : []);
  };

  const loadStudyGroups = async () => {
    const data = await fetchData('/student-flow/api/study-groups/');
    if (data) setStudyGroups(Array.isArray(data) ? data : []);
  };

  const loadLearningGoals = async () => {
    const data = await fetchData('/student-flow/api/goals/');
    if (data) setLearningGoals(Array.isArray(data) ? data : []);
  };

  const loadResources = async () => {
    const data = await fetchData('/student-flow/api/resources/');
    if (data) setResources(Array.isArray(data) ? data : []);
  };

  // Create test data functions
  const createProfile = async () => {
    const profileData = {
      user_id: 1, // Mock user ID
      academic_level: 'undergraduate',
      field_of_study: 'Computer Science',
      learning_style: 'visual',
      goals: ['Learn React', 'Master JavaScript', 'Build projects'],
      interests: ['web-development', 'mobile-apps'],
      timezone: 'America/New_York',
      preferred_study_time: 'morning'
    };
    const result = await postData('/student-flow/api/profile/create/', profileData);
    if (result) loadProfile();
  };

  const createLearningGoal = async () => {
    const goalData = {
      title: `Learn React ${Date.now()}`,
      description: 'Master React fundamentals and build projects',
      category: 'technical',
      priority: 'high',
      target_completion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active'
    };
    const result = await postData('/student-flow/api/goals/', goalData);
    if (result) loadLearningGoals();
  };

  // Register a test student
  const registerStudent = async () => {
    const studentData = {
      email: `teststudent${Date.now()}@example.com`,
      first_name: 'Test',
      last_name: 'Student'
    };
    const result = await postData('/api/student/register/', studentData);
    if (result) setMessage('✅ Student registered successfully');
  };

  return (
    <div className="dashboard">
      <h2>📚 Student Dashboard</h2>
      
      {loading && <div className="loading">Loading...</div>}
      {message && <div className="message">{message}</div>}

      <div className="dashboard-grid">
        {/* Student Profile Section */}
        <div className="dashboard-card">
          <h3>👤 Profile</h3>
          <button onClick={loadProfile}>Load Profile</button>
          <button onClick={createProfile}>Create Test Profile</button>
          <button onClick={registerStudent}>Register Test Student</button>
          <div className="data-content">
            {profile ? (
              <div className="data-item">
                <strong>Academic Level:</strong> {profile.academic_level}
                <br />
                <strong>Field:</strong> {profile.field_of_study}
                <br />
                <strong>Learning Style:</strong> {profile.learning_style}
              </div>
            ) : (
              <div>No profile found</div>
            )}
          </div>
        </div>

        {/* Learning Progress Section */}
        <div className="dashboard-card">
          <h3>📈 Learning Progress</h3>
          <button onClick={loadProgress}>Load Progress</button>
          <button onClick={loadDashboard}>Load Dashboard Stats</button>
          <div className="data-content">
            {progress ? (
              <div className="data-item">
                <strong>Overall Progress:</strong> {progress.overall_progress}%
                <br />
                <strong>Completed Sessions:</strong> {progress.completed_sessions || 0}
                <br />
                <strong>Total Hours:</strong> {progress.total_hours || 0}
              </div>
            ) : (
              <div>No progress data found</div>
            )}
          </div>
        </div>

        {/* Enrollments Section */}
        <div className="dashboard-card">
          <h3>📋 Course Enrollments</h3>
          <button onClick={loadEnrollments}>Load Enrollments</button>
          <div className="data-list">
            {enrollments.length > 0 ? (
              enrollments.map((enrollment, index) => (
                <div key={index} className="data-item">
                  <strong>Enrollment #{index + 1}</strong>
                  <br />
                  <small>Status: {enrollment.status}</small>
                  <br />
                  <small>Progress: {enrollment.progress_percentage || 0}%</small>
                </div>
              ))
            ) : (
              <div>No enrollments found</div>
            )}
          </div>
        </div>

        {/* Assignments Section */}
        <div className="dashboard-card">
          <h3>📝 Assignments</h3>
          <button onClick={loadAssignments}>Load Assignments</button>
          <div className="data-list">
            {assignments.length > 0 ? (
              assignments.map((assignment, index) => (
                <div key={index} className="data-item">
                  <strong>Assignment #{index + 1}</strong>
                  <br />
                  <small>Status: {assignment.status}</small>
                  <br />
                  <small>Grade: {assignment.grade || 'Not graded'}</small>
                </div>
              ))
            ) : (
              <div>No assignments found</div>
            )}
          </div>
        </div>

        {/* Study Groups Section */}
        <div className="dashboard-card">
          <h3>👥 Study Groups</h3>
          <button onClick={loadStudyGroups}>Load Study Groups</button>
          <div className="data-list">
            {studyGroups.length > 0 ? (
              studyGroups.map((group, index) => (
                <div key={index} className="data-item">
                  <strong>{group.name || `Group #${index + 1}`}</strong>
                  <br />
                  <small>Members: {group.member_count || 0}</small>
                  <br />
                  <small>Topic: {group.focus_area || 'General'}</small>
                </div>
              ))
            ) : (
              <div>No study groups found</div>
            )}
          </div>
        </div>

        {/* Learning Goals Section */}
        <div className="dashboard-card">
          <h3>🎯 Learning Goals</h3>
          <button onClick={loadLearningGoals}>Load Goals</button>
          <button onClick={createLearningGoal}>Create Test Goal</button>
          <div className="data-list">
            {learningGoals.length > 0 ? (
              learningGoals.map((goal, index) => (
                <div key={index} className="data-item">
                  <strong>{goal.title}</strong>
                  <br />
                  <small>Priority: {goal.priority}</small>
                  <br />
                  <small>Status: {goal.status}</small>
                </div>
              ))
            ) : (
              <div>No learning goals found</div>
            )}
          </div>
        </div>

        {/* Learning Resources Section */}
        <div className="dashboard-card">
          <h3>📚 Learning Resources</h3>
          <button onClick={loadResources}>Load Resources</button>
          <button onClick={() => fetchData('/student-flow/api/resources/public/')}>
            Load Public Resources
          </button>
          <div className="data-list">
            {resources.length > 0 ? (
              resources.map((resource, index) => (
                <div key={index} className="data-item">
                  <strong>{resource.title || `Resource #${index + 1}`}</strong>
                  <br />
                  <small>Type: {resource.content_type}</small>
                  <br />
                  <small>Difficulty: {resource.difficulty_level}</small>
                </div>
              ))
            ) : (
              <div>No resources found</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h3>⚡ Quick Actions</h3>
          <button onClick={() => fetchData('/student-flow/api/stats/')}>
            Load Statistics
          </button>
          <button onClick={() => setMessage('📅 Start learning session feature coming soon!')}>
            Start Session
          </button>
          <button onClick={() => setMessage('💬 Join study group feature coming soon!')}>
            Join Study Group
          </button>
          <button onClick={() => fetchData('/api/students/')}>
            List All Students
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
