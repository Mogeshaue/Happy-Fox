import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [teams, setTeams] = useState([]);
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
  const loadOrganizations = async () => {
    const data = await fetchData('/admin-flow/api/organizations/');
    if (data) setOrganizations(Array.isArray(data) ? data : []);
  };

  const loadUsers = async () => {
    const data = await fetchData('api/admin-flow/api/users/');
    if (data) setUsers(Array.isArray(data) ? data : []);
  };

  const loadCourses = async () => {
    const data = await fetchData('/api/admin/courses/');
    if (data) setCourses(Array.isArray(data) ? data : []);
  };

  const loadCohorts = async () => {
    const data = await fetchData('/api/admin/cohorts/');
    if (data) setCohorts(Array.isArray(data) ? data : []);
  };

  const loadTeams = async () => {
    const data = await fetchData('/api/admin/teams/');
    if (data) setTeams(Array.isArray(data) ? data : []);
  };

  // Create data functions
  const createCourse = async () => {
    const courseData = {
      name: `Test Course ${Date.now()}`,
      description: 'Test course created from admin dashboard'
    };
    const result = await postData('/api/admin/courses/', courseData);
    if (result) loadCourses();
  };

  const createCohort = async () => {
    if (courses.length === 0) {
      setMessage('❌ Create a course first!');
      return;
    }
    const cohortData = {
      name: `Test Cohort ${Date.now()}`,
      course: courses[0].id,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    const result = await postData('/api/admin/cohorts/', cohortData);
    if (result) loadCohorts();
  };

  const createTeam = async () => {
    if (cohorts.length === 0) {
      setMessage('❌ Create a cohort first!');
      return;
    }
    const teamData = {
      name: `Test Team ${Date.now()}`,
      cohort: cohorts[0].id
    };
    const result = await postData('/api/admin/teams/', teamData);
    if (result) loadTeams();
  };

  return (
    <div className="dashboard">
      <h2>👑 Admin Dashboard</h2>
      
      {loading && <div className="loading">Loading...</div>}
      {message && <div className="message">{message}</div>}

      <div className="dashboard-grid">
        {/* Organizations Section */}
        <div className="dashboard-card">
          <h3>🏢 Organizations</h3>
          <button onClick={loadOrganizations}>Load Organizations</button>
          <div className="data-list">
            {organizations.length > 0 ? (
              organizations.map((org, index) => (
                <div key={index} className="data-item">
                  <strong>{org.name}</strong> - {org.slug}
                </div>
              ))
            ) : (
              <div>No organizations found</div>
            )}
          </div>
        </div>

        {/* Users Section */}
        <div className="dashboard-card">
          <h3>👥 Users</h3>
          <button onClick={loadUsers}>Load Users</button>
          <div className="data-list">
            {users.length > 0 ? (
              users.map((user, index) => (
                <div key={index} className="data-item">
                  <strong>{user.full_name || user.email}</strong>
                </div>
              ))
            ) : (
              <div>No users found</div>
            )}
          </div>
        </div>

        {/* Courses Section */}
        <div className="dashboard-card">
          <h3>📚 Courses</h3>
          <button onClick={loadCourses}>Load Courses</button>
          <button onClick={createCourse}>Create Test Course</button>
          <div className="data-list">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="data-item">
                  <strong>{course.name}</strong>
                  <br />
                  <small>{course.description}</small>
                </div>
              ))
            ) : (
              <div>No courses found</div>
            )}
          </div>
        </div>

        {/* Cohorts Section */}
        <div className="dashboard-card">
          <h3>🎯 Cohorts</h3>
          <button onClick={loadCohorts}>Load Cohorts</button>
          <button onClick={createCohort}>Create Test Cohort</button>
          <div className="data-list">
            {cohorts.length > 0 ? (
              cohorts.map((cohort) => (
                <div key={cohort.id} className="data-item">
                  <strong>{cohort.name}</strong>
                  <br />
                  <small>{cohort.start_date} to {cohort.end_date}</small>
                </div>
              ))
            ) : (
              <div>No cohorts found</div>
            )}
          </div>
        </div>

        {/* Teams Section */}
        <div className="dashboard-card">
          <h3>👥 Teams</h3>
          <button onClick={loadTeams}>Load Teams</button>
          <button onClick={createTeam}>Create Test Team</button>
          <div className="data-list">
            {teams.length > 0 ? (
              teams.map((team) => (
                <div key={team.id} className="data-item">
                  <strong>{team.name}</strong>
                  <br />
                  <small>Cohort: {team.cohort}</small>
                </div>
              ))
            ) : (
              <div>No teams found</div>
            )}
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="dashboard-card">
          <h3>⚡ Quick Actions</h3>
          <button onClick={() => fetchData('/api/admin-flow/api/dashboard/')}>
            Load Admin Dashboard
          </button>
          <button onClick={() => fetchData('/admin-flow/api/analytics/')}>
            Load Analytics
          </button>
          <button onClick={() => fetchData('/api/hello/')}>
            Test API Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
