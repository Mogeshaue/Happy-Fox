/**
 * Study Group Service
 * Single Responsibility: Handle study group operations
 * Open/Closed: Extensible for new collaboration features
 * Liskov Substitution: Implements IApiService interface
 * Interface Segregation: Focused on study group operations
 * Dependency Inversion: Depends on ApiClient abstraction
 */

import { HttpClient } from '../../admin-flow/services/ApiClient.js';

export class StudyGroupService {
  constructor(apiClient = new HttpClient()) {
    this.apiClient = apiClient;
    this.baseUrl = '/api/student_flow/study-groups';
  }

  /**
   * Get study groups for a student
   */
  async getStudentStudyGroups(studentId) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/student/${studentId}/`,
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch study groups:', error);
      // Return mock data for development
      return [
        {
          id: 1,
          name: 'React Study Circle',
          description: 'Weekly React.js study sessions and project collaboration',
          courseId: 1,
          courseName: 'React Development',
          memberCount: 8,
          maxMembers: 12,
          isActive: true,
          meetingSchedule: 'Thursdays 7:00 PM EST',
          nextMeeting: '2024-01-25T19:00:00Z',
          role: 'member',
          createdAt: '2024-01-10',
          tags: ['react', 'javascript', 'frontend'],
          currentTopic: 'Advanced Hooks Patterns'
        },
        {
          id: 2,
          name: 'Algorithm Masterminds',
          description: 'Daily algorithm practice and code review sessions',
          courseId: 2,
          courseName: 'Data Structures & Algorithms',
          memberCount: 5,
          maxMembers: 8,
          isActive: true,
          meetingSchedule: 'Daily 6:00 PM EST',
          nextMeeting: '2024-01-23T18:00:00Z',
          role: 'moderator',
          createdAt: '2024-01-05',
          tags: ['algorithms', 'data-structures', 'problem-solving'],
          currentTopic: 'Dynamic Programming Fundamentals'
        },
        {
          id: 3,
          name: 'Full-Stack Builders',
          description: 'End-to-end project development and peer learning',
          courseId: null,
          courseName: 'Cross-curricular',
          memberCount: 15,
          maxMembers: 20,
          isActive: true,
          meetingSchedule: 'Saturdays 10:00 AM EST',
          nextMeeting: '2024-01-27T10:00:00Z',
          role: 'member',
          createdAt: '2024-01-01',
          tags: ['full-stack', 'projects', 'collaboration'],
          currentTopic: 'MERN Stack Project Planning'
        }
      ];
    }
  }

  /**
   * Get available study groups to join
   */
  async getAvailableStudyGroups(studentId, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        course_id: filters.courseId || '',
        tags: filters.tags?.join(',') || '',
        max_members_available: filters.hasSpace || false
      }).toString();

      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/available/?${queryParams}`,
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch available study groups:', error);
      // Return mock data for development
      return [
        {
          id: 4,
          name: 'CSS Grid Masters',
          description: 'Master CSS Grid through collaborative projects',
          courseId: 3,
          courseName: 'Advanced CSS',
          memberCount: 6,
          maxMembers: 10,
          isActive: true,
          meetingSchedule: 'Tuesdays 8:00 PM EST',
          tags: ['css', 'grid', 'layout'],
          canJoin: true,
          requiresApproval: false
        },
        {
          id: 5,
          name: 'Node.js Ninjas',
          description: 'Backend development and API design practice',
          courseId: 4,
          courseName: 'Backend Development',
          memberCount: 12,
          maxMembers: 15,
          isActive: true,
          meetingSchedule: 'Wednesdays 7:30 PM EST',
          tags: ['nodejs', 'backend', 'api'],
          canJoin: true,
          requiresApproval: true
        }
      ];
    }
  }

  /**
   * Join a study group
   */
  async joinStudyGroup(groupId, studentId, message = '') {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/${groupId}/join/`,
        method: 'POST',
        data: {
          student_id: studentId,
          join_message: message,
          joined_at: new Date().toISOString()
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to join study group:', error);
      throw error;
    }
  }

  /**
   * Leave a study group
   */
  async leaveStudyGroup(groupId, studentId) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/${groupId}/leave/`,
        method: 'POST',
        data: {
          student_id: studentId,
          left_at: new Date().toISOString()
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to leave study group:', error);
      throw error;
    }
  }

  /**
   * Create a new study group
   */
  async createStudyGroup(studentId, groupData) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/create/`,
        method: 'POST',
        data: {
          name: groupData.name,
          description: groupData.description,
          course_id: groupData.courseId,
          max_members: groupData.maxMembers,
          meeting_schedule: groupData.meetingSchedule,
          tags: groupData.tags,
          requires_approval: groupData.requiresApproval || false,
          creator_id: studentId,
          created_at: new Date().toISOString()
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to create study group:', error);
      throw error;
    }
  }

  /**
   * Get study group activity feed
   */
  async getStudyGroupActivity(groupId, limit = 20) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/${groupId}/activity/?limit=${limit}`,
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch study group activity:', error);
      // Return mock data for development
      return [
        {
          id: 1,
          type: 'meeting_scheduled',
          message: 'New meeting scheduled for Thursday 7:00 PM',
          author: 'Sarah Chen',
          timestamp: '2024-01-22T15:30:00Z',
          data: { meetingDate: '2024-01-25T19:00:00Z' }
        },
        {
          id: 2,
          type: 'resource_shared',
          message: 'Shared: React Hooks Cheatsheet',
          author: 'Mike Johnson',
          timestamp: '2024-01-22T10:15:00Z',
          data: { resourceUrl: 'https://example.com/react-hooks-cheatsheet' }
        },
        {
          id: 3,
          type: 'member_joined',
          message: 'Alex Rodriguez joined the group',
          author: 'System',
          timestamp: '2024-01-21T14:20:00Z',
          data: { memberName: 'Alex Rodriguez' }
        }
      ];
    }
  }

  /**
   * Post message to study group
   */
  async postMessage(groupId, studentId, message, attachments = []) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/${groupId}/messages/`,
        method: 'POST',
        data: {
          author_id: studentId,
          message_content: message,
          attachments,
          posted_at: new Date().toISOString()
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to post message:', error);
      throw error;
    }
  }

  /**
   * Schedule study session
   */
  async scheduleSession(groupId, sessionData) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/${groupId}/sessions/`,
        method: 'POST',
        data: {
          title: sessionData.title,
          description: sessionData.description,
          scheduled_date: sessionData.date,
          duration_minutes: sessionData.duration,
          meeting_url: sessionData.meetingUrl,
          agenda: sessionData.agenda
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to schedule session:', error);
      throw error;
    }
  }
}

export default StudyGroupService;
