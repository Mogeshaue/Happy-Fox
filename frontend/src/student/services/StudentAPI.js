import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

class StudentAPI {
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

  // Dashboard and Overview
  async getDashboard() {
    try {
      const response = await this.api.get('/student-flow/api/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      throw new Error('Failed to load dashboard data');
    }
  }

  async getProgress() {
    try {
      const response = await this.api.get('/student-flow/api/progress/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      throw new Error('Failed to load progress data');
    }
  }

  async getStats() {
    try {
      const response = await this.api.get('/student-flow/api/stats/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      throw new Error('Failed to load statistics');
    }
  }

  // Student Profile Management
  async getProfile() {
    try {
      const response = await this.api.get('/student-flow/api/profile/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw new Error('Failed to load profile');
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await this.api.patch('/student-flow/api/profile/', profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  async createProfile(profileData) {
    try {
      const response = await this.api.post('/student-flow/api/profile/create/', profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw new Error('Failed to create profile');
    }
  }

  // Course Enrollment
  async getEnrollments() {
    try {
      const response = await this.api.get('/student-flow/api/enrollments/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      throw new Error('Failed to load enrollments');
    }
  }

  async getEnrollment(enrollmentId) {
    try {
      const response = await this.api.get(`/student-flow/api/enrollments/${enrollmentId}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch enrollment:', error);
      throw new Error('Failed to load enrollment details');
    }
  }

  async getAvailableCourses() {
    try {
      const response = await this.api.get('/student-flow/api/available-courses/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch available courses:', error);
      throw new Error('Failed to load available courses');
    }
  }

  // Learning Sessions
  async getLearningsessions() {
    try {
      const response = await this.api.get('/student-flow/api/sessions/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch learning sessions:', error);
      throw new Error('Failed to load learning sessions');
    }
  }

  async createLearningSession(sessionData) {
    try {
      const response = await this.api.post('/student-flow/api/sessions/', sessionData);
      return response.data;
    } catch (error) {
      console.error('Failed to create learning session:', error);
      throw new Error('Failed to start learning session');
    }
  }

  async updateLearningSession(sessionId, sessionData) {
    try {
      const response = await this.api.patch(`/student-flow/api/sessions/${sessionId}/`, sessionData);
      return response.data;
    } catch (error) {
      console.error('Failed to update learning session:', error);
      throw new Error('Failed to update learning session');
    }
  }

  async endLearningSession(sessionUuid) {
    try {
      const response = await this.api.put(`/student-flow/api/sessions/${sessionUuid}/end/`);
      return response.data;
    } catch (error) {
      console.error('Failed to end learning session:', error);
      throw new Error('Failed to end learning session');
    }
  }

  // Assignment Management
  async getAssignments() {
    try {
      const response = await this.api.get('/student-flow/api/assignments/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      throw new Error('Failed to load assignments');
    }
  }

  async createAssignmentSubmission(submissionData) {
    try {
      const response = await this.api.post('/student-flow/api/assignments/', submissionData);
      return response.data;
    } catch (error) {
      console.error('Failed to create assignment submission:', error);
      throw new Error('Failed to submit assignment');
    }
  }

  async updateAssignmentSubmission(submissionId, submissionData) {
    try {
      const response = await this.api.patch(`/student-flow/api/assignments/${submissionId}/`, submissionData);
      return response.data;
    } catch (error) {
      console.error('Failed to update assignment submission:', error);
      throw new Error('Failed to update submission');
    }
  }

  async submitAssignment(submissionUuid) {
    try {
      const response = await this.api.put(`/student-flow/api/assignments/${submissionUuid}/submit/`);
      return response.data;
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      throw new Error('Failed to submit assignment');
    }
  }

  // Study Groups
  async getStudyGroups() {
    try {
      const response = await this.api.get('/student-flow/api/study-groups/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch study groups:', error);
      throw new Error('Failed to load study groups');
    }
  }

  async createStudyGroup(groupData) {
    try {
      const response = await this.api.post('/student-flow/api/study-groups/', groupData);
      return response.data;
    } catch (error) {
      console.error('Failed to create study group:', error);
      throw new Error('Failed to create study group');
    }
  }

  async joinStudyGroup(groupId) {
    try {
      const response = await this.api.post(`/student-flow/api/study-groups/${groupId}/join/`);
      return response.data;
    } catch (error) {
      console.error('Failed to join study group:', error);
      throw new Error('Failed to join study group');
    }
  }

  async leaveStudyGroup(groupId) {
    try {
      const response = await this.api.post(`/student-flow/api/study-groups/${groupId}/leave/`);
      return response.data;
    } catch (error) {
      console.error('Failed to leave study group:', error);
      throw new Error('Failed to leave study group');
    }
  }

  // Learning Goals
  async getLearningGoals() {
    try {
      const response = await this.api.get('/student-flow/api/goals/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch learning goals:', error);
      throw new Error('Failed to load learning goals');
    }
  }

  async createLearningGoal(goalData) {
    try {
      const response = await this.api.post('/student-flow/api/goals/', goalData);
      return response.data;
    } catch (error) {
      console.error('Failed to create learning goal:', error);
      throw new Error('Failed to create learning goal');
    }
  }

  async updateLearningGoal(goalId, goalData) {
    try {
      const response = await this.api.patch(`/student-flow/api/goals/${goalId}/`, goalData);
      return response.data;
    } catch (error) {
      console.error('Failed to update learning goal:', error);
      throw new Error('Failed to update learning goal');
    }
  }

  async deleteLearningGoal(goalId) {
    try {
      await this.api.delete(`/student-flow/api/goals/${goalId}/`);
    } catch (error) {
      console.error('Failed to delete learning goal:', error);
      throw new Error('Failed to delete learning goal');
    }
  }

  // Quiz Attempts
  async getQuizAttempts() {
    try {
      const response = await this.api.get('/student-flow/api/quiz-attempts/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quiz attempts:', error);
      throw new Error('Failed to load quiz attempts');
    }
  }

  async createQuizAttempt(attemptData) {
    try {
      const response = await this.api.post('/student-flow/api/quiz-attempts/', attemptData);
      return response.data;
    } catch (error) {
      console.error('Failed to create quiz attempt:', error);
      throw new Error('Failed to start quiz');
    }
  }

  async updateQuizAttempt(attemptUuid, attemptData) {
    try {
      const response = await this.api.patch(`/student-flow/api/quiz-attempts/${attemptUuid}/`, attemptData);
      return response.data;
    } catch (error) {
      console.error('Failed to update quiz attempt:', error);
      throw new Error('Failed to update quiz attempt');
    }
  }

  async completeQuizAttempt(attemptUuid) {
    try {
      const response = await this.api.put(`/student-flow/api/quiz-attempts/${attemptUuid}/complete/`);
      return response.data;
    } catch (error) {
      console.error('Failed to complete quiz attempt:', error);
      throw new Error('Failed to complete quiz');
    }
  }

  // Notifications
  async getNotifications() {
    try {
      const response = await this.api.get('/student-flow/api/notifications/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw new Error('Failed to load notifications');
    }
  }

  async markNotificationAsRead(notificationUuid) {
    try {
      const response = await this.api.put(`/student-flow/api/notifications/${notificationUuid}/read/`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllNotificationsAsRead() {
    try {
      const response = await this.api.post('/student-flow/api/notifications/mark-all-read/');
      return response.data;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  // Analytics & Achievements
  async getAnalytics() {
    try {
      const response = await this.api.get('/student-flow/api/analytics/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw new Error('Failed to load analytics');
    }
  }

  async getAchievements() {
    try {
      const response = await this.api.get('/student-flow/api/achievements/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      throw new Error('Failed to load achievements');
    }
  }

  async getCompletions() {
    try {
      const response = await this.api.get('/student-flow/api/completions/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch completions:', error);
      throw new Error('Failed to load completion history');
    }
  }

  // Learning Resources
  async getLearningResources() {
    try {
      const response = await this.api.get('/student-flow/api/resources/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch learning resources:', error);
      throw new Error('Failed to load learning resources');
    }
  }

  async createLearningResource(resourceData) {
    try {
      const response = await this.api.post('/student-flow/api/resources/', resourceData);
      return response.data;
    } catch (error) {
      console.error('Failed to create learning resource:', error);
      throw new Error('Failed to create learning resource');
    }
  }

  async updateLearningResource(resourceId, resourceData) {
    try {
      const response = await this.api.patch(`/student-flow/api/resources/${resourceId}/`, resourceData);
      return response.data;
    } catch (error) {
      console.error('Failed to update learning resource:', error);
      throw new Error('Failed to update learning resource');
    }
  }

  async deleteLearningResource(resourceId) {
    try {
      await this.api.delete(`/student-flow/api/resources/${resourceId}/`);
    } catch (error) {
      console.error('Failed to delete learning resource:', error);
      throw new Error('Failed to delete learning resource');
    }
  }

  // Calendar Integration
  async getCalendar() {
    try {
      const response = await this.api.get('/student-flow/api/calendar/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch calendar:', error);
      throw new Error('Failed to load calendar');
    }
  }
}

export default new StudentAPI();
