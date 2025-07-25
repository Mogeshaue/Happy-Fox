/**
 * Student Flow Store
 * Single Responsibility: Manage student flow application state
 * Open/Closed: Extensible for new student state management
 * Liskov Substitution: Consistent state management interface
 * Interface Segregation: Focused on student flow state
 * Dependency Inversion: Depends on service abstractions
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import StudentFlowAPI from '../services/StudentFlowAPI.js';

const studentFlowAPI = new StudentFlowAPI();

export const useStudentFlowStore = create()(
  devtools(
    (set, get) => ({
      // Student Data
      student: null,
      studentId: null,

      // Dashboard Data
      dashboardData: null,
      overviewStats: null,

      // Progress Data
      overallProgress: null,
      courseProgress: {},
      learningAnalytics: null,
      recommendations: [],

      // Assignment Data
      assignments: [],
      assignmentDetails: {},
      submissionHistory: {},

      // Study Group Data
      studyGroups: [],
      availableStudyGroups: [],
      studyGroupActivity: {},

      // UI State
      loading: {
        dashboard: false,
        progress: false,
        assignments: false,
        studyGroups: false
      },
      errors: {},

      // Actions
      setStudentId: (studentId) => {
        set({ studentId }, false, 'setStudentId');
      },

      // Dashboard Actions
      fetchDashboardData: async () => {
        const { studentId } = get();
        if (!studentId) return;

        set(
          (state) => ({
            loading: { ...state.loading, dashboard: true },
            errors: { ...state.errors, dashboard: null }
          }),
          false,
          'fetchDashboardData:start'
        );

        try {
          const [dashboardData, overviewStats] = await Promise.all([
            studentFlowAPI.getDashboardData(studentId),
            studentFlowAPI.getOverviewStats(studentId)
          ]);

          set(
            (state) => ({
              dashboardData,
              overviewStats,
              overallProgress: dashboardData.progress,
              assignments: dashboardData.assignments,
              studyGroups: dashboardData.studyGroups,
              recommendations: dashboardData.recommendations,
              loading: { ...state.loading, dashboard: false }
            }),
            false,
            'fetchDashboardData:success'
          );
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error);
          set(
            (state) => ({
              loading: { ...state.loading, dashboard: false },
              errors: { ...state.errors, dashboard: error.message }
            }),
            false,
            'fetchDashboardData:error'
          );
        }
      },

      // Progress Actions
      fetchProgress: async () => {
        const { studentId } = get();
        if (!studentId) return;

        set(
          (state) => ({
            loading: { ...state.loading, progress: true },
            errors: { ...state.errors, progress: null }
          }),
          false,
          'fetchProgress:start'
        );

        try {
          const [overallProgress, analytics] = await Promise.all([
            studentFlowAPI.progressService.getOverallProgress(studentId),
            studentFlowAPI.progressService.getLearningAnalytics(studentId)
          ]);

          set(
            (state) => ({
              overallProgress,
              learningAnalytics: analytics,
              loading: { ...state.loading, progress: false }
            }),
            false,
            'fetchProgress:success'
          );
        } catch (error) {
          console.error('Failed to fetch progress:', error);
          set(
            (state) => ({
              loading: { ...state.loading, progress: false },
              errors: { ...state.errors, progress: error.message }
            }),
            false,
            'fetchProgress:error'
          );
        }
      },

      fetchCourseProgress: async (courseId) => {
        const { studentId } = get();
        if (!studentId) return;

        try {
          const courseProgress = await studentFlowAPI.progressService.getCourseProgress(
            studentId,
            courseId
          );

          set(
            (state) => ({
              courseProgress: {
                ...state.courseProgress,
                [courseId]: courseProgress
              }
            }),
            false,
            'fetchCourseProgress:success'
          );
        } catch (error) {
          console.error('Failed to fetch course progress:', error);
        }
      },

      updateLessonCompletion: async (lessonId, completed = true) => {
        const { studentId } = get();
        if (!studentId) return;

        try {
          await studentFlowAPI.progressService.updateLessonCompletion(
            studentId,
            lessonId,
            completed
          );

          // Refresh progress data
          await get().fetchProgress();
        } catch (error) {
          console.error('Failed to update lesson completion:', error);
          throw error;
        }
      },

      // Assignment Actions
      fetchAssignments: async (status = 'all') => {
        const { studentId } = get();
        if (!studentId) return;

        set(
          (state) => ({
            loading: { ...state.loading, assignments: true },
            errors: { ...state.errors, assignments: null }
          }),
          false,
          'fetchAssignments:start'
        );

        try {
          const assignments = await studentFlowAPI.assignmentService.getStudentAssignments(
            studentId,
            status
          );

          set(
            (state) => ({
              assignments,
              loading: { ...state.loading, assignments: false }
            }),
            false,
            'fetchAssignments:success'
          );
        } catch (error) {
          console.error('Failed to fetch assignments:', error);
          set(
            (state) => ({
              loading: { ...state.loading, assignments: false },
              errors: { ...state.errors, assignments: error.message }
            }),
            false,
            'fetchAssignments:error'
          );
        }
      },

      fetchAssignmentDetails: async (assignmentId) => {
        try {
          const details = await studentFlowAPI.assignmentService.getAssignmentDetails(
            assignmentId
          );

          set(
            (state) => ({
              assignmentDetails: {
                ...state.assignmentDetails,
                [assignmentId]: details
              }
            }),
            false,
            'fetchAssignmentDetails:success'
          );
        } catch (error) {
          console.error('Failed to fetch assignment details:', error);
        }
      },

      submitAssignment: async (assignmentId, submission) => {
        try {
          await studentFlowAPI.assignmentService.submitAssignment(
            assignmentId,
            submission
          );

          // Refresh assignments
          await get().fetchAssignments();
        } catch (error) {
          console.error('Failed to submit assignment:', error);
          throw error;
        }
      },

      saveDraft: async (assignmentId, draftData) => {
        try {
          await studentFlowAPI.assignmentService.saveDraft(assignmentId, draftData);
        } catch (error) {
          console.error('Failed to save draft:', error);
          // Don't throw for draft saves
        }
      },

      // Study Group Actions
      fetchStudyGroups: async () => {
        const { studentId } = get();
        if (!studentId) return;

        set(
          (state) => ({
            loading: { ...state.loading, studyGroups: true },
            errors: { ...state.errors, studyGroups: null }
          }),
          false,
          'fetchStudyGroups:start'
        );

        try {
          const [studyGroups, availableGroups] = await Promise.all([
            studentFlowAPI.studyGroupService.getStudentStudyGroups(studentId),
            studentFlowAPI.studyGroupService.getAvailableStudyGroups(studentId)
          ]);

          set(
            (state) => ({
              studyGroups,
              availableStudyGroups: availableGroups,
              loading: { ...state.loading, studyGroups: false }
            }),
            false,
            'fetchStudyGroups:success'
          );
        } catch (error) {
          console.error('Failed to fetch study groups:', error);
          set(
            (state) => ({
              loading: { ...state.loading, studyGroups: false },
              errors: { ...state.errors, studyGroups: error.message }
            }),
            false,
            'fetchStudyGroups:error'
          );
        }
      },

      joinStudyGroup: async (groupId, message = '') => {
        const { studentId } = get();
        if (!studentId) return;

        try {
          await studentFlowAPI.studyGroupService.joinStudyGroup(
            groupId,
            studentId,
            message
          );

          // Refresh study groups
          await get().fetchStudyGroups();
        } catch (error) {
          console.error('Failed to join study group:', error);
          throw error;
        }
      },

      leaveStudyGroup: async (groupId) => {
        const { studentId } = get();
        if (!studentId) return;

        try {
          await studentFlowAPI.studyGroupService.leaveStudyGroup(groupId, studentId);

          // Refresh study groups
          await get().fetchStudyGroups();
        } catch (error) {
          console.error('Failed to leave study group:', error);
          throw error;
        }
      },

      createStudyGroup: async (groupData) => {
        const { studentId } = get();
        if (!studentId) return;

        try {
          await studentFlowAPI.studyGroupService.createStudyGroup(studentId, groupData);

          // Refresh study groups
          await get().fetchStudyGroups();
        } catch (error) {
          console.error('Failed to create study group:', error);
          throw error;
        }
      },

      fetchStudyGroupActivity: async (groupId) => {
        try {
          const activity = await studentFlowAPI.studyGroupService.getStudyGroupActivity(
            groupId
          );

          set(
            (state) => ({
              studyGroupActivity: {
                ...state.studyGroupActivity,
                [groupId]: activity
              }
            }),
            false,
            'fetchStudyGroupActivity:success'
          );
        } catch (error) {
          console.error('Failed to fetch study group activity:', error);
        }
      },

      // Utility Actions
      clearError: (errorType) => {
        set(
          (state) => ({
            errors: { ...state.errors, [errorType]: null }
          }),
          false,
          'clearError'
        );
      },

      clearAllErrors: () => {
        set({ errors: {} }, false, 'clearAllErrors');
      },

      reset: () => {
        set(
          {
            student: null,
            studentId: null,
            dashboardData: null,
            overviewStats: null,
            overallProgress: null,
            courseProgress: {},
            learningAnalytics: null,
            recommendations: [],
            assignments: [],
            assignmentDetails: {},
            submissionHistory: {},
            studyGroups: [],
            availableStudyGroups: [],
            studyGroupActivity: {},
            loading: {
              dashboard: false,
              progress: false,
              assignments: false,
              studyGroups: false
            },
            errors: {}
          },
          false,
          'reset'
        );
      }
    }),
    {
      name: 'student-flow-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

export default useStudentFlowStore;
