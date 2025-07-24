import { httpClient, API_CONFIG } from './ApiService';

// Admin Service - Single Responsibility for admin operations
export class AdminService {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  // Courses
  async getCourses() {
    return this.httpClient.get(API_CONFIG.ENDPOINTS.ADMIN.COURSES);
  }

  async createCourse(courseData) {
    return this.httpClient.post(API_CONFIG.ENDPOINTS.ADMIN.COURSES, courseData);
  }

  async deleteCourse(id) {
    return this.httpClient.delete(`${API_CONFIG.ENDPOINTS.ADMIN.COURSES}${id}/`);
  }

  // Cohorts
  async getCohorts() {
    return this.httpClient.get(API_CONFIG.ENDPOINTS.ADMIN.COHORTS);
  }

  async createCohort(cohortData) {
    return this.httpClient.post(API_CONFIG.ENDPOINTS.ADMIN.COHORTS, cohortData);
  }

  async deleteCohort(id) {
    return this.httpClient.delete(`${API_CONFIG.ENDPOINTS.ADMIN.COHORTS}${id}/`);
  }

  // Teams
  async getTeams() {
    return this.httpClient.get(API_CONFIG.ENDPOINTS.ADMIN.TEAMS);
  }

  async createTeam(teamData) {
    return this.httpClient.post(API_CONFIG.ENDPOINTS.ADMIN.TEAMS, teamData);
  }

  async deleteTeam(id) {
    return this.httpClient.delete(`${API_CONFIG.ENDPOINTS.ADMIN.TEAMS}${id}/`);
  }

  // Invitations
  async getInvitations() {
    return this.httpClient.get(API_CONFIG.ENDPOINTS.ADMIN.INVITATIONS);
  }

  async createInvitation(invitationData) {
    return this.httpClient.post(API_CONFIG.ENDPOINTS.ADMIN.INVITATIONS, invitationData);
  }

  async deleteInvitation(id) {
    return this.httpClient.delete(`${API_CONFIG.ENDPOINTS.ADMIN.INVITATIONS}${id}/`);
  }
}

export const adminService = new AdminService(httpClient);
