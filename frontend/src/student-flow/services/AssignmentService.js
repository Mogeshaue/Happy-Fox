/**
 * Assignment Service
 * Single Responsibility: Handle student assignments and submissions
 * Open/Closed: Extensible for new assignment types
 * Liskov Substitution: Implements IApiService interface
 * Interface Segregation: Focused on assignment operations
 * Dependency Inversion: Depends on ApiClient abstraction
 */

import { HttpClient } from '../../admin-flow/services/ApiClient.js';

export class AssignmentService {
  constructor(apiClient = new HttpClient()) {
    this.apiClient = apiClient;
    this.baseUrl = '/api/student_flow/assignments';
  }

  /**
   * Get all assignments for a student
   */
  async getStudentAssignments(studentId, status = 'all') {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/student/${studentId}/?status=${status}`,
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      // Return mock data for development
      return [
        {
          id: 1,
          title: 'React Todo App',
          description: 'Build a fully functional todo application using React hooks',
          courseId: 1,
          courseName: 'React Development',
          dueDate: '2024-01-30',
          status: 'in_progress',
          maxScore: 100,
          currentScore: null,
          submittedAt: null,
          feedback: null,
          requirements: [
            'Use functional components and hooks',
            'Implement CRUD operations',
            'Add responsive design',
            'Include unit tests'
          ],
          resources: [
            { name: 'React Hooks Documentation', url: 'https://reactjs.org/docs/hooks-intro.html' },
            { name: 'Testing Library Guide', url: 'https://testing-library.com/docs/' }
          ]
        },
        {
          id: 2,
          title: 'JavaScript Algorithm Challenge',
          description: 'Solve 5 medium-level algorithm problems',
          courseId: 2,
          courseName: 'Data Structures & Algorithms',
          dueDate: '2024-01-25',
          status: 'submitted',
          maxScore: 50,
          currentScore: 42,
          submittedAt: '2024-01-23T10:30:00Z',
          feedback: 'Good solutions overall. Consider optimizing the time complexity in problem 3.',
          requirements: [
            'Submit solutions in JavaScript',
            'Include time/space complexity analysis',
            'Write clean, readable code'
          ]
        },
        {
          id: 3,
          title: 'CSS Grid Layout Project',
          description: 'Create a responsive layout using CSS Grid',
          courseId: 3,
          courseName: 'Advanced CSS',
          dueDate: '2024-02-05',
          status: 'not_started',
          maxScore: 75,
          currentScore: null,
          submittedAt: null,
          feedback: null,
          requirements: [
            'Use CSS Grid for main layout',
            'Ensure mobile responsiveness',
            'Follow accessibility guidelines'
          ]
        }
      ];
    }
  }

  /**
   * Get assignment details
   */
  async getAssignmentDetails(assignmentId) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/${assignmentId}/`,
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch assignment details:', error);
      throw error;
    }
  }

  /**
   * Submit assignment
   */
  async submitAssignment(assignmentId, submission) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/${assignmentId}/submit/`,
        method: 'POST',
        data: {
          submission_text: submission.text,
          file_urls: submission.files || [],
          repository_url: submission.repositoryUrl,
          demo_url: submission.demoUrl,
          submitted_at: new Date().toISOString()
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      throw error;
    }
  }

  /**
   * Save assignment draft
   */
  async saveDraft(assignmentId, draftData) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/${assignmentId}/draft/`,
        method: 'POST',
        data: {
          draft_content: draftData.content,
          auto_saved_at: new Date().toISOString()
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to save draft:', error);
      // Don't throw for draft saves, just log
      return null;
    }
  }

  /**
   * Get assignment submissions history
   */
  async getSubmissionHistory(assignmentId) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/${assignmentId}/submissions/`,
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch submission history:', error);
      return [];
    }
  }

  /**
   * Request assignment extension
   */
  async requestExtension(assignmentId, extensionData) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/${assignmentId}/extension/`,
        method: 'POST',
        data: {
          requested_due_date: extensionData.newDueDate,
          reason: extensionData.reason,
          additional_notes: extensionData.notes
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to request extension:', error);
      throw error;
    }
  }

  /**
   * Get assignment feedback
   */
  async getAssignmentFeedback(assignmentId) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/${assignmentId}/feedback/`,
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      // Return mock data for development
      return {
        assignmentId,
        overallScore: 85,
        maxScore: 100,
        feedback: 'Excellent work on the React application! Your component structure is well organized.',
        criteria: [
          {
            name: 'Code Quality',
            score: 90,
            maxScore: 100,
            feedback: 'Clean, readable code with good naming conventions'
          },
          {
            name: 'Functionality',
            score: 85,
            maxScore: 100,
            feedback: 'All requirements met, minor issue with error handling'
          },
          {
            name: 'Design',
            score: 80,
            maxScore: 100,
            feedback: 'Good responsive design, could improve accessibility'
          }
        ],
        submittedAt: '2024-01-20T14:30:00Z',
        gradedAt: '2024-01-22T09:15:00Z',
        mentorName: 'Sarah Johnson'
      };
    }
  }
}

export default AssignmentService;
