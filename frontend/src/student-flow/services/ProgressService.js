/**
 * Progress Service
 * Single Responsibility: Handle student progress data
 * Open/Closed: Extensible for new progress tracking features
 * Liskov Substitution: Implements IApiService interface
 * Interface Segregation: Focused on progress operations
 * Dependency Inversion: Depends on ApiClient abstraction
 */

import { HttpClient } from '../../admin-flow/services/ApiClient.js';

export class ProgressService {
  constructor(apiClient = new HttpClient()) {
    this.apiClient = apiClient;
    this.baseUrl = '/api/student_flow/progress';
  }

  /**
   * Get student's overall progress
   */
  async getOverallProgress(studentId) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/overall/${studentId}/`,
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch overall progress:', error);
      // Return mock data for development
      return {
        id: studentId,
        totalCourses: 5,
        completedCourses: 2,
        inProgressCourses: 2,
        notStartedCourses: 1,
        overallPercentage: 65,
        studyStreak: 7,
        totalStudyHours: 45.5,
        skillsLearned: 12,
        achievements: [
          { id: 1, name: 'First Course Completed', earnedAt: '2024-01-15' },
          { id: 2, name: 'Study Streak - 7 Days', earnedAt: '2024-01-20' }
        ]
      };
    }
  }

  /**
   * Get course-specific progress
   */
  async getCourseProgress(studentId, courseId) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/course/${courseId}/student/${studentId}/`,
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch course progress:', error);
      // Return mock data for development
      return {
        courseId,
        courseName: 'React Development Fundamentals',
        completionPercentage: 75,
        modulesCompleted: 6,
        totalModules: 8,
        timeSpent: 12.5,
        lastAccessed: '2024-01-22',
        nextModule: 'Advanced Hooks',
        quizScores: [
          { module: 'Introduction', score: 85 },
          { module: 'Components', score: 92 },
          { module: 'State Management', score: 78 }
        ]
      };
    }
  }

  /**
   * Update lesson completion
   */
  async updateLessonCompletion(studentId, lessonId, completed = true) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/lesson/${lessonId}/completion/`,
        method: 'POST',
        data: {
          student_id: studentId,
          completed,
          completed_at: new Date().toISOString()
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to update lesson completion:', error);
      throw error;
    }
  }

  /**
   * Get learning analytics
   */
  async getLearningAnalytics(studentId, timeframe = '30d') {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/analytics/${studentId}/?timeframe=${timeframe}`,
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch learning analytics:', error);
      // Return mock data for development
      return {
        timeframe,
        studyTime: {
          daily: [2.5, 1.8, 3.2, 0, 2.1, 4.0, 1.5],
          weekly: [15.2, 18.5, 22.1, 19.8],
          monthly: 65.6
        },
        moduleCompletions: {
          completed: 24,
          inProgress: 3,
          planned: 8
        },
        skillProgress: [
          { skill: 'JavaScript', level: 75 },
          { skill: 'React', level: 60 },
          { skill: 'CSS', level: 85 },
          { skill: 'Node.js', level: 45 }
        ],
        strengths: ['Problem Solving', 'Code Quality'],
        improvements: ['Algorithm Optimization', 'Testing']
      };
    }
  }

  /**
   * Get recommended next steps
   */
  async getRecommendations(studentId) {
    try {
      const response = await this.apiClient.makeRequest({
        url: `${this.baseUrl}/recommendations/${studentId}/`,
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      // Return mock data for development
      return [
        {
          type: 'course',
          title: 'Advanced React Patterns',
          description: 'Build on your React knowledge with advanced patterns',
          priority: 'high',
          estimatedTime: '8 hours'
        },
        {
          type: 'practice',
          title: 'JavaScript Algorithm Challenges',
          description: 'Strengthen your problem-solving skills',
          priority: 'medium',
          estimatedTime: '4 hours'
        },
        {
          type: 'review',
          title: 'Review State Management',
          description: 'Reinforce your understanding of Redux and Context',
          priority: 'low',
          estimatedTime: '2 hours'
        }
      ];
    }
  }
}

export default ProgressService;
