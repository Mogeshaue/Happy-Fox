import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

class UnifiedLMSAPI {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests if available
    this.api.interceptors.request.use((config) => {
      const authData = localStorage.getItem('auth_data');
      if (authData) {
        try {
          const auth = JSON.parse(authData);
          if (auth.user?.id) {
            config.headers['Authorization'] = `Bearer ${auth.user.id}`;
          }
        } catch (error) {
          console.warn('Failed to parse auth data:', error);
        }
      }
      return config;
    });

    // Handle response errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('auth_data');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ===================================
  // AUTHENTICATION & USER MANAGEMENT
  // ===================================
  
  async authenticateUser(authData) {
    try {
      const response = await this.api.post('/api/auth/google/enhanced/', authData);
      return response.data;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Authentication failed');
    }
  }

  async devAuthBypass(userData) {
    try {
      const response = await this.api.post('/api/auth/dev-bypass/', userData);
      return response.data;
    } catch (error) {
      console.error('Dev auth failed:', error);
      throw new Error('Development authentication failed');
    }
  }

  // ===================================
  // ADMIN FLOW APIs
  // ===================================

  // Course Management
  async getCourses() {
    try {
      const response = await this.api.get('/api/admin/courses/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      throw new Error('Failed to load courses');
    }
  }

  async createCourse(courseData) {
    try {
      const response = await this.api.post('/api/admin/courses/', courseData);
      return response.data;
    } catch (error) {
      console.error('Failed to create course:', error);
      throw new Error('Failed to create course');
    }
  }

  async updateCourse(courseId, courseData) {
    try {
      const response = await this.api.put(`/api/admin/courses/${courseId}/`, courseData);
      return response.data;
    } catch (error) {
      console.error('Failed to update course:', error);
      throw new Error('Failed to update course');
    }
  }

  async deleteCourse(courseId) {
    try {
      await this.api.delete(`/api/admin/courses/${courseId}/`);
    } catch (error) {
      console.error('Failed to delete course:', error);
      throw new Error('Failed to delete course');
    }
  }

  // Cohort Management
  async getCohorts() {
    try {
      const response = await this.api.get('/api/admin/cohorts/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cohorts:', error);
      throw new Error('Failed to load cohorts');
    }
  }

  async createCohort(cohortData) {
    try {
      const response = await this.api.post('/api/admin/cohorts/', cohortData);
      return response.data;
    } catch (error) {
      console.error('Failed to create cohort:', error);
      throw new Error('Failed to create cohort');
    }
  }

  async updateCohort(cohortId, cohortData) {
    try {
      const response = await this.api.put(`/api/admin/cohorts/${cohortId}/`, cohortData);
      return response.data;
    } catch (error) {
      console.error('Failed to update cohort:', error);
      throw new Error('Failed to update cohort');
    }
  }

  async deleteCohort(cohortId) {
    try {
      await this.api.delete(`/api/admin/cohorts/${cohortId}/`);
    } catch (error) {
      console.error('Failed to delete cohort:', error);
      throw new Error('Failed to delete cohort');
    }
  }

  // Team Management
  async getTeams() {
    try {
      const response = await this.api.get('/api/admin/teams/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      throw new Error('Failed to load teams');
    }
  }

  async createTeam(teamData) {
    try {
      const response = await this.api.post('/api/admin/teams/', teamData);
      return response.data;
    } catch (error) {
      console.error('Failed to create team:', error);
      throw new Error('Failed to create team');
    }
  }

  async updateTeam(teamId, teamData) {
    try {
      const response = await this.api.put(`/api/admin/teams/${teamId}/`, teamData);
      return response.data;
    } catch (error) {
      console.error('Failed to update team:', error);
      throw new Error('Failed to update team');
    }
  }

  async deleteTeam(teamId) {
    try {
      await this.api.delete(`/api/admin/teams/${teamId}/`);
    } catch (error) {
      console.error('Failed to delete team:', error);
      throw new Error('Failed to delete team');
    }
  }

  // Invitation Management
  async getInvitations() {
    try {
      const response = await this.api.get('/api/admin/invitations/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
      throw new Error('Failed to load invitations');
    }
  }

  async createInvitation(invitationData) {
    try {
      const response = await this.api.post('/api/admin/invitations/', invitationData);
      return response.data;
    } catch (error) {
      console.error('Failed to create invitation:', error);
      throw new Error('Failed to send invitation');
    }
  }

  async updateInvitation(invitationId, invitationData) {
    try {
      const response = await this.api.put(`/api/admin/invitations/${invitationId}/`, invitationData);
      return response.data;
    } catch (error) {
      console.error('Failed to update invitation:', error);
      throw new Error('Failed to update invitation');
    }
  }

  async deleteInvitation(invitationId) {
    try {
      await this.api.delete(`/api/admin/invitations/${invitationId}/`);
    } catch (error) {
      console.error('Failed to delete invitation:', error);
      throw new Error('Failed to delete invitation');
    }
  }

  // ===================================
  // STUDENT FLOW APIs
  // ===================================

  // Student Dashboard and Profile
  async getStudentDashboard() {
    try {
      const response = await this.api.get('/student-flow/api/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch student dashboard:', error);
      throw new Error('Failed to load dashboard');
    }
  }

  async getStudentProfile() {
    try {
      const response = await this.api.get('/student-flow/api/profile/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch student profile:', error);
      throw new Error('Failed to load profile');
    }
  }

  async updateStudentProfile(profileData) {
    try {
      const response = await this.api.patch('/student-flow/api/profile/', profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update student profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  async createStudentProfile(profileData) {
    try {
      const response = await this.api.post('/student-flow/api/profile/create/', profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to create student profile:', error);
      throw new Error('Failed to create profile');
    }
  }

  // Student Enrollments
  async getStudentEnrollments() {
    try {
      const response = await this.api.get('/student-flow/api/enrollments/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      throw new Error('Failed to load enrollments');
    }
  }

  // Student Learning Sessions
  async getStudentSessions() {
    try {
      const response = await this.api.get('/student-flow/api/sessions/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch learning sessions:', error);
      throw new Error('Failed to load learning sessions');
    }
  }

  async createStudentSession(sessionData) {
    try {
      const response = await this.api.post('/student-flow/api/sessions/', sessionData);
      return response.data;
    } catch (error) {
      console.error('Failed to create learning session:', error);
      throw new Error('Failed to start learning session');
    }
  }

  // Student Goals
  async getStudentGoals() {
    try {
      const response = await this.api.get('/student-flow/api/goals/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch learning goals:', error);
      throw new Error('Failed to load learning goals');
    }
  }

  async createStudentGoal(goalData) {
    try {
      const response = await this.api.post('/student-flow/api/goals/', goalData);
      return response.data;
    } catch (error) {
      console.error('Failed to create learning goal:', error);
      throw new Error('Failed to create learning goal');
    }
  }

  // Student Study Groups
  async getStudentStudyGroups() {
    try {
      const response = await this.api.get('/student-flow/api/study-groups/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch study groups:', error);
      throw new Error('Failed to load study groups');
    }
  }

  async createStudentStudyGroup(groupData) {
    try {
      const response = await this.api.post('/student-flow/api/study-groups/', groupData);
      return response.data;
    } catch (error) {
      console.error('Failed to create study group:', error);
      throw new Error('Failed to create study group');
    }
  }

  // Student Analytics
  async getStudentAnalytics() {
    try {
      const response = await this.api.get('/student-flow/api/analytics/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw new Error('Failed to load analytics');
    }
  }

  // Student Achievements
  async getStudentAchievements() {
    try {
      const response = await this.api.get('/student-flow/api/achievements/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      throw new Error('Failed to load achievements');
    }
  }

  // ===================================
  // MENTOR FLOW APIs
  // ===================================

  // Mentor Dashboard
  async getMentorDashboard() {
    try {
      const response = await this.api.get('/mentor/api/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch mentor dashboard:', error);
      throw new Error('Failed to load mentor dashboard');
    }
  }

  // Mentor Profile
  async getMentorProfile() {
    try {
      const response = await this.api.get('/mentor/api/profile/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch mentor profile:', error);
      throw new Error('Failed to load mentor profile');
    }
  }

  async updateMentorProfile(profileData) {
    try {
      const response = await this.api.patch('/mentor/api/profile/', profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update mentor profile:', error);
      throw new Error('Failed to update mentor profile');
    }
  }

  // Mentor Assignments
  async getMentorAssignments() {
    try {
      const response = await this.api.get('/mentor/api/assignments/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch mentor assignments:', error);
      throw new Error('Failed to load assignments');
    }
  }

  // Mentor Students
  async getMentorStudents() {
    try {
      const response = await this.api.get('/mentor/api/students/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch mentor students:', error);
      throw new Error('Failed to load students');
    }
  }

  async getMentorStudentDetails(studentId) {
    try {
      const response = await this.api.get(`/mentor/api/students/${studentId}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch student details:', error);
      throw new Error('Failed to load student details');
    }
  }

  // Mentor Sessions
  async getMentorSessions() {
    try {
      const response = await this.api.get('/mentor/api/sessions/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch mentor sessions:', error);
      throw new Error('Failed to load sessions');
    }
  }

  async createMentorSession(sessionData) {
    try {
      const response = await this.api.post('/mentor/api/sessions/', sessionData);
      return response.data;
    } catch (error) {
      console.error('Failed to create mentor session:', error);
      throw new Error('Failed to create session');
    }
  }

  // Mentor Messages
  async getMentorMessages() {
    try {
      const response = await this.api.get('/mentor/api/messages/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch mentor messages:', error);
      throw new Error('Failed to load messages');
    }
  }

  async sendMentorMessage(messageData) {
    try {
      const response = await this.api.post('/mentor/api/messages/', messageData);
      return response.data;
    } catch (error) {
      console.error('Failed to send mentor message:', error);
      throw new Error('Failed to send message');
    }
  }

  // ===================================
  // HEALTH CHECK
  // ===================================

  async healthCheck() {
    try {
      const response = await this.api.get('/api/hello/');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Backend connection failed');
    }
  }

  // ===================================
  // UTILITY METHODS
  // ===================================

  // Get statistics for dashboard
  async getStatistics() {
    try {
      const [courses, cohorts, teams] = await Promise.all([
        this.getCourses(),
        this.getCohorts(), 
        this.getTeams()
      ]);

      return {
        totalCourses: courses?.length || 0,
        totalCohorts: cohorts?.length || 0,
        totalTeams: teams?.length || 0,
        totalInvitations: 0 // Will be populated when invitations are loaded
      };
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      return {
        totalCourses: 0,
        totalCohorts: 0,
        totalTeams: 0,
        totalInvitations: 0
      };
    }
  }
}

export default new UnifiedLMSAPI();
