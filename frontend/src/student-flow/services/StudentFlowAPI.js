/**
 * Student Flow API Service
 * Single Responsibility: Aggregate student flow services
 * Open/Closed: Extensible for new student services
 * Liskov Substitution: All services implement consistent interfaces
 * Interface Segregation: Focused service aggregation
 * Dependency Inversion: Depends on service abstractions
 */

import ProgressService from './ProgressService.js';
import AssignmentService from './AssignmentService.js';
import StudyGroupService from './StudyGroupService.js';

export class StudentFlowAPI {
  constructor() {
    this.progressService = new ProgressService();
    this.assignmentService = new AssignmentService();
    this.studyGroupService = new StudyGroupService();
  }

  /**
   * Get comprehensive dashboard data for a student
   */
  async getDashboardData(studentId) {
    try {
      const [
        overallProgress,
        assignments,
        studyGroups,
        analytics,
        recommendations
      ] = await Promise.all([
        this.progressService.getOverallProgress(studentId),
        this.assignmentService.getStudentAssignments(studentId, 'active'),
        this.studyGroupService.getStudentStudyGroups(studentId),
        this.progressService.getLearningAnalytics(studentId, '7d'),
        this.progressService.getRecommendations(studentId)
      ]);

      return {
        progress: overallProgress,
        assignments: assignments.slice(0, 5), // Latest 5 assignments
        studyGroups: studyGroups.slice(0, 3), // Latest 3 study groups
        analytics,
        recommendations: recommendations.slice(0, 3), // Top 3 recommendations
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get student overview statistics
   */
  async getOverviewStats(studentId) {
    try {
      const [progress, assignments, studyGroups] = await Promise.all([
        this.progressService.getOverallProgress(studentId),
        this.assignmentService.getStudentAssignments(studentId),
        this.studyGroupService.getStudentStudyGroups(studentId)
      ]);

      const activeAssignments = assignments.filter(a => 
        a.status === 'in_progress' || a.status === 'not_started'
      );
      
      const completedAssignments = assignments.filter(a => 
        a.status === 'submitted' || a.status === 'graded'
      );

      const activeStudyGroups = studyGroups.filter(g => g.isActive);

      return {
        totalCourses: progress.totalCourses || 0,
        coursesInProgress: progress.inProgressCourses || 0,
        coursesCompleted: progress.completedCourses || 0,
        overallProgress: progress.overallPercentage || 0,
        assignmentsPending: activeAssignments.length,
        assignmentsCompleted: completedAssignments.length,
        studyGroupsActive: activeStudyGroups.length,
        studyStreak: progress.studyStreak || 0,
        totalStudyHours: progress.totalStudyHours || 0,
        skillsLearned: progress.skillsLearned || 0
      };
    } catch (error) {
      console.error('Failed to fetch overview stats:', error);
      return {
        totalCourses: 0,
        coursesInProgress: 0,
        coursesCompleted: 0,
        overallProgress: 0,
        assignmentsPending: 0,
        assignmentsCompleted: 0,
        studyGroupsActive: 0,
        studyStreak: 0,
        totalStudyHours: 0,
        skillsLearned: 0
      };
    }
  }

  /**
   * Health check for student flow services
   */
  async healthCheck() {
    try {
      const checks = await Promise.allSettled([
        this.progressService.getOverallProgress('health-check'),
        this.assignmentService.getStudentAssignments('health-check'),
        this.studyGroupService.getStudentStudyGroups('health-check')
      ]);

      return {
        progressService: checks[0].status === 'fulfilled',
        assignmentService: checks[1].status === 'fulfilled',
        studyGroupService: checks[2].status === 'fulfilled',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        progressService: false,
        assignmentService: false,
        studyGroupService: false,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Quick actions for students
   */
  async quickAction(action, studentId, data = {}) {
    try {
      switch (action) {
        case 'complete_lesson':
          return await this.progressService.updateLessonCompletion(
            studentId, 
            data.lessonId, 
            true
          );
        
        case 'submit_assignment':
          return await this.assignmentService.submitAssignment(
            data.assignmentId, 
            data.submission
          );
        
        case 'join_study_group':
          return await this.studyGroupService.joinStudyGroup(
            data.groupId, 
            studentId, 
            data.message
          );
        
        case 'save_assignment_draft':
          return await this.assignmentService.saveDraft(
            data.assignmentId, 
            data.draftData
          );
        
        default:
          throw new Error(`Unknown quick action: ${action}`);
      }
    } catch (error) {
      console.error(`Failed to execute quick action ${action}:`, error);
      throw error;
    }
  }
}

export default StudentFlowAPI;
