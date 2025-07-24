import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboardBasic = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://127.0.0.1:8000/api/admin';

  // Form states
  const [courseForm, setCourseForm] = useState({ name: '', description: '' });
  const [cohortForm, setCohortForm] = useState({ name: '', course: '', start_date: '', end_date: '' });
  const [teamForm, setTeamForm] = useState({ name: '', cohort: '' });
  const [invitationForm, setInvitationForm] = useState({ email: '', team: '' });

  // Fetch data functions
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/`);
      const data = await response.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to fetch courses');
    }
  };

  const fetchCohorts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cohorts/`);
      const data = await response.json();
      setCohorts(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to fetch cohorts');
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/`);
      const data = await response.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to fetch teams');
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/`);
      const data = await response.json();
      setInvitations(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to fetch invitations');
    }
  };

  // Create functions
  const createCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/courses/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm),
      });
      if (response.ok) {
        setCourseForm({ name: '', description: '' });
        fetchCourses();
        setError('');
      } else {
        setError('Failed to create course');
      }
    } catch (error) {
      setError('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const createCohort = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cohorts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cohortForm),
      });
      if (response.ok) {
        setCohortForm({ name: '', course: '', start_date: '', end_date: '' });
        fetchCohorts();
        setError('');
      } else {
        setError('Failed to create cohort');
      }
    } catch (error) {
      setError('Failed to create cohort');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teams/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm),
      });
      if (response.ok) {
        setTeamForm({ name: '', cohort: '' });
        fetchTeams();
        setError('');
      } else {
        setError('Failed to create team');
      }
    } catch (error) {
      setError('Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/invitations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...invitationForm, invited_by: 3 }), // Using test user ID
      });
      if (response.ok) {
        setInvitationForm({ email: '', team: '' });
        fetchInvitations();
        setError('');
      } else {
        setError('Failed to create invitation');
      }
    } catch (error) {
      setError('Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCohorts();
    fetchTeams();
    fetchInvitations();
  }, []);

  const getCourseNameById = (id) => {
    const course = courses.find(c => c.id === id);
    return course ? course.name : `Course ${id}`;
  };

  const getCohortNameById = (id) => {
    const cohort = cohorts.find(c => c.id === id);
    return cohort ? cohort.name : `Cohort ${id}`;
  };

  const getTeamNameById = (id) => {
    const team = teams.find(t => t.id === id);
    return team ? team.name : `Team ${id}`;
  };

  return (
    <div className="admin-dashboard">
      <h1>LMS Admin Dashboard</h1>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <nav className="admin-nav">
        <button 
          className={activeTab === 'courses' ? 'active' : ''} 
          onClick={() => setActiveTab('courses')}
        >
          Courses ({courses.length})
        </button>
        <button 
          className={activeTab === 'cohorts' ? 'active' : ''} 
          onClick={() => setActiveTab('cohorts')}
        >
          Cohorts ({cohorts.length})
        </button>
        <button 
          className={activeTab === 'teams' ? 'active' : ''} 
          onClick={() => setActiveTab('teams')}
        >
          Teams ({teams.length})
        </button>
        <button 
          className={activeTab === 'invitations' ? 'active' : ''} 
          onClick={() => setActiveTab('invitations')}
        >
          Invitations ({invitations.length})
        </button>
      </nav>

      {loading && <div className="loading">Loading...</div>}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="tab-content">
          <h2>Course Management</h2>
          
          <div className="form-section">
            <h3>Create New Course</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Course Name"
                value={courseForm.name}
                onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
              />
              <textarea
                placeholder="Course Description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
              />
              <button onClick={createCourse} disabled={loading || !courseForm.name}>
                Create Course
              </button>
            </div>
          </div>

          <div className="list-section">
            <h3>Existing Courses</h3>
            {courses.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.id}>
                      <td>{course.id}</td>
                      <td>{course.name}</td>
                      <td>{course.description}</td>
                      <td>{new Date(course.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No courses found. Create one above.</p>
            )}
          </div>
        </div>
      )}

      {/* Cohorts Tab */}
      {activeTab === 'cohorts' && (
        <div className="tab-content">
          <h2>Cohort Management</h2>
          
          <div className="form-section">
            <h3>Create New Cohort</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Cohort Name"
                value={cohortForm.name}
                onChange={(e) => setCohortForm({...cohortForm, name: e.target.value})}
              />
              <select
                value={cohortForm.course}
                onChange={(e) => setCohortForm({...cohortForm, course: e.target.value})}
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
              <input
                type="date"
                value={cohortForm.start_date}
                onChange={(e) => setCohortForm({...cohortForm, start_date: e.target.value})}
              />
              <input
                type="date"
                value={cohortForm.end_date}
                onChange={(e) => setCohortForm({...cohortForm, end_date: e.target.value})}
              />
              <button 
                onClick={createCohort} 
                disabled={loading || !cohortForm.name || !cohortForm.course}
              >
                Create Cohort
              </button>
            </div>
          </div>

          <div className="list-section">
            <h3>Existing Cohorts</h3>
            {cohorts.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map(cohort => (
                    <tr key={cohort.id}>
                      <td>{cohort.id}</td>
                      <td>{cohort.name}</td>
                      <td>{getCourseNameById(cohort.course)}</td>
                      <td>{cohort.start_date}</td>
                      <td>{cohort.end_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No cohorts found. Create one above.</p>
            )}
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="tab-content">
          <h2>Team Management</h2>
          
          <div className="form-section">
            <h3>Create New Team</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Team Name"
                value={teamForm.name}
                onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
              />
              <select
                value={teamForm.cohort}
                onChange={(e) => setTeamForm({...teamForm, cohort: e.target.value})}
              >
                <option value="">Select Cohort</option>
                {cohorts.map(cohort => (
                  <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                ))}
              </select>
              <button 
                onClick={createTeam} 
                disabled={loading || !teamForm.name || !teamForm.cohort}
              >
                Create Team
              </button>
            </div>
          </div>

          <div className="list-section">
            <h3>Existing Teams</h3>
            {teams.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Cohort</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map(team => (
                    <tr key={team.id}>
                      <td>{team.id}</td>
                      <td>{team.name}</td>
                      <td>{getCohortNameById(team.cohort)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No teams found. Create one above.</p>
            )}
          </div>
        </div>
      )}

      {/* Invitations Tab */}
      {activeTab === 'invitations' && (
        <div className="tab-content">
          <h2>Invitation Management</h2>
          
          <div className="form-section">
            <h3>Send New Invitation</h3>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email Address"
                value={invitationForm.email}
                onChange={(e) => setInvitationForm({...invitationForm, email: e.target.value})}
              />
              <select
                value={invitationForm.team}
                onChange={(e) => setInvitationForm({...invitationForm, team: e.target.value})}
              >
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <button 
                onClick={createInvitation} 
                disabled={loading || !invitationForm.email || !invitationForm.team}
              >
                Send Invitation
              </button>
            </div>
          </div>

          <div className="list-section">
            <h3>Existing Invitations</h3>
            {invitations.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Team</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map(invitation => (
                    <tr key={invitation.id}>
                      <td>{invitation.id}</td>
                      <td>{invitation.email}</td>
                      <td>{getTeamNameById(invitation.team)}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          backgroundColor: invitation.accepted ? '#d4edda' : '#fff3cd',
                          color: invitation.accepted ? '#155724' : '#856404'
                        }}>
                          {invitation.accepted ? 'Accepted' : 'Pending'}
                        </span>
                      </td>
                      <td>{new Date(invitation.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No invitations found. Send one above.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardBasic;
