import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import MentorAPI from '../services/mentorAPI.js';
import AssignmentAPI from '../services/assignmentAPI.js';
import SessionAPI from '../services/sessionAPI.js';
import MessageAPI from '../services/messageAPI.js';
import toast from 'react-hot-toast';

const useMentorStore = create(
  devtools(
    (set, get) => ({
      // State
      mentorProfile: null,
      assignments: [],
      activeAssignments: [],
      sessions: [],
      upcomingSessions: [],
      messages: [],
      unreadMessageCount: 0,
      dashboardData: null,
      stats: null,
      loading: {
        profile: false,
        assignments: false,
        sessions: false,
        messages: false,
        dashboard: false,
        stats: false,
      },
      errors: {},

      // Actions

      /**
       * Set loading state for specific operation
       */
      setLoading: (operation, isLoading) =>
        set((state) => ({
          loading: { ...state.loading, [operation]: isLoading }
        })),

      /**
       * Set error for specific operation
       */
      setError: (operation, error) =>
        set((state) => ({
          errors: { ...state.errors, [operation]: error }
        })),

      /**
       * Clear error for specific operation
       */
      clearError: (operation) =>
        set((state) => ({
          errors: { ...state.errors, [operation]: null }
        })),

      /**
       * Fetch mentor profile
       */
      fetchMentorProfile: async () => {
        const { setLoading, setError, clearError } = get();
        setLoading('profile', true);
        clearError('profile');

        try {
          const profile = await MentorAPI.getMyProfile();
          set({ mentorProfile: profile });
          return profile;
        } catch (error) {
          console.error('Failed to fetch mentor profile:', error);
          setError('profile', error.message);
          throw error;
        } finally {
          setLoading('profile', false);
        }
      },

      /**
       * Update mentor profile
       */
      updateMentorProfile: async (profileData) => {
        const { setLoading, setError, clearError, mentorProfile } = get();
        setLoading('profile', true);
        clearError('profile');

        try {
          const updatedProfile = await MentorAPI.updateMentorProfile(
            mentorProfile?.id,
            profileData
          );
          set({ mentorProfile: updatedProfile });
          toast.success('Profile updated successfully');
          return updatedProfile;
        } catch (error) {
          console.error('Failed to update mentor profile:', error);
          setError('profile', error.message);
          throw error;
        } finally {
          setLoading('profile', false);
        }
      },

      /**
       * Create mentor profile
       */
      createMentorProfile: async (profileData) => {
        const { setLoading, setError, clearError } = get();
        setLoading('profile', true);
        clearError('profile');

        try {
          const newProfile = await MentorAPI.createMentorProfile(profileData);
          set({ mentorProfile: newProfile });
          toast.success('Mentor profile created successfully');
          return newProfile;
        } catch (error) {
          console.error('Failed to create mentor profile:', error);
          setError('profile', error.message);
          throw error;
        } finally {
          setLoading('profile', false);
        }
      },

      /**
       * Fetch mentor assignments
       */
      fetchAssignments: async (filters = {}) => {
        const { setLoading, setError, clearError } = get();
        setLoading('assignments', true);
        clearError('assignments');

        try {
          const assignments = await AssignmentAPI.getMentorAssignments(filters);
          set({ assignments });
          
          // Also set active assignments
          const activeAssignments = assignments.filter(a => a.status === 'active');
          set({ activeAssignments });
          
          return assignments;
        } catch (error) {
          console.error('Failed to fetch assignments:', error);
          setError('assignments', error.message);
          throw error;
        } finally {
          setLoading('assignments', false);
        }
      },

      /**
       * Fetch active assignments
       */
      fetchActiveAssignments: async () => {
        const { setLoading, setError, clearError } = get();
        setLoading('assignments', true);
        clearError('assignments');

        try {
          const activeAssignments = await AssignmentAPI.getActiveAssignments();
          set({ activeAssignments });
          return activeAssignments;
        } catch (error) {
          console.error('Failed to fetch active assignments:', error);
          setError('assignments', error.message);
          throw error;
        } finally {
          setLoading('assignments', false);
        }
      },

      /**
       * Update assignment status
       */
      updateAssignmentStatus: async (assignmentId, status) => {
        const { assignments, activeAssignments } = get();
        
        try {
          let updatedAssignment;
          
          switch (status) {
            case 'active':
              updatedAssignment = await AssignmentAPI.activateAssignment(assignmentId);
              break;
            case 'completed':
              updatedAssignment = await AssignmentAPI.completeAssignment(assignmentId);
              break;
            default:
              updatedAssignment = await AssignmentAPI.updateAssignment(assignmentId, { status });
          }

          // Update assignments in state
          const updatedAssignments = assignments.map(a => 
            a.id === assignmentId ? updatedAssignment : a
          );
          set({ assignments: updatedAssignments });

          // Update active assignments
          const updatedActiveAssignments = activeAssignments.filter(a => 
            a.id !== assignmentId || a.status === 'active'
          );
          if (status === 'active') {
            updatedActiveAssignments.push(updatedAssignment);
          }
          set({ activeAssignments: updatedActiveAssignments });

          toast.success(`Assignment ${status} successfully`);
          return updatedAssignment;
        } catch (error) {
          console.error('Failed to update assignment status:', error);
          toast.error('Failed to update assignment status');
          throw error;
        }
      },

      /**
       * Fetch sessions
       */
      fetchSessions: async (filters = {}) => {
        const { setLoading, setError, clearError } = get();
        setLoading('sessions', true);
        clearError('sessions');

        try {
          const sessions = await SessionAPI.getSessions(filters);
          set({ sessions });
          return sessions;
        } catch (error) {
          console.error('Failed to fetch sessions:', error);
          setError('sessions', error.message);
          throw error;
        } finally {
          setLoading('sessions', false);
        }
      },

      /**
       * Fetch upcoming sessions
       */
      fetchUpcomingSessions: async () => {
        const { setLoading, setError, clearError } = get();
        setLoading('sessions', true);
        clearError('sessions');

        try {
          const upcomingSessions = await SessionAPI.getUpcomingSessions();
          set({ upcomingSessions });
          return upcomingSessions;
        } catch (error) {
          console.error('Failed to fetch upcoming sessions:', error);
          setError('sessions', error.message);
          throw error;
        } finally {
          setLoading('sessions', false);
        }
      },

      /**
       * Create session
       */
      createSession: async (sessionData) => {
        const { sessions, upcomingSessions } = get();
        
        try {
          const newSession = await SessionAPI.createSession(sessionData);
          
          // Add to sessions list
          set({ sessions: [...sessions, newSession] });
          
          // Add to upcoming sessions if scheduled
          if (newSession.status === 'scheduled') {
            set({ upcomingSessions: [...upcomingSessions, newSession] });
          }
          
          toast.success('Session created successfully');
          return newSession;
        } catch (error) {
          console.error('Failed to create session:', error);
          toast.error('Failed to create session');
          throw error;
        }
      },

      /**
       * Update session
       */
      updateSession: async (sessionId, sessionData) => {
        const { sessions, upcomingSessions } = get();
        
        try {
          const updatedSession = await SessionAPI.updateSession(sessionId, sessionData);
          
          // Update in sessions list
          const updatedSessions = sessions.map(s => 
            s.id === sessionId ? updatedSession : s
          );
          set({ sessions: updatedSessions });
          
          // Update in upcoming sessions
          const updatedUpcomingSessions = upcomingSessions.map(s => 
            s.id === sessionId ? updatedSession : s
          );
          set({ upcomingSessions: updatedUpcomingSessions });
          
          toast.success('Session updated successfully');
          return updatedSession;
        } catch (error) {
          console.error('Failed to update session:', error);
          toast.error('Failed to update session');
          throw error;
        }
      },

      /**
       * Fetch messages
       */
      fetchMessages: async (assignmentId) => {
        const { setLoading, setError, clearError } = get();
        setLoading('messages', true);
        clearError('messages');

        try {
          const messages = await MessageAPI.getAssignmentMessages(assignmentId);
          set({ messages });
          return messages;
        } catch (error) {
          console.error('Failed to fetch messages:', error);
          setError('messages', error.message);
          throw error;
        } finally {
          setLoading('messages', false);
        }
      },

      /**
       * Send message
       */
      sendMessage: async (messageData) => {
        const { messages } = get();
        
        try {
          const newMessage = await MessageAPI.sendMessage(messageData);
          set({ messages: [...messages, newMessage] });
          return newMessage;
        } catch (error) {
          console.error('Failed to send message:', error);
          toast.error('Failed to send message');
          throw error;
        }
      },

      /**
       * Fetch unread message count
       */
      fetchUnreadMessageCount: async () => {
        try {
          const count = await MessageAPI.getUnreadCount();
          set({ unreadMessageCount: count });
          return count;
        } catch (error) {
          console.error('Failed to fetch unread message count:', error);
          return 0;
        }
      },

      /**
       * Fetch dashboard data
       */
      fetchDashboardData: async () => {
        const { setLoading, setError, clearError } = get();
        setLoading('dashboard', true);
        clearError('dashboard');

        try {
          const dashboardData = await MentorAPI.getDashboardData();
          console.log('Dashboard Data:', dashboardData);
          set({ dashboardData });
          return dashboardData;
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error);
          setError('dashboard', error.message);
          throw error;
        } finally {
          setLoading('dashboard', false);
        }
      },

      /**
       * Fetch mentor stats
       */
      fetchMentorStats: async () => {
        const { setLoading, setError, clearError } = get();
        setLoading('stats', true);
        clearError('stats');

        try {
          const stats = await MentorAPI.getMentorStats();
          set({ stats });
          return stats;
        } catch (error) {
          console.error('Failed to fetch mentor stats:', error);
          setError('stats', error.message);
          throw error;
        } finally {
          setLoading('stats', false);
        }
      },

      /**
       * Reset store state
       */
      reset: () => {
        set({
          mentorProfile: null,
          assignments: [],
          activeAssignments: [],
          sessions: [],
          upcomingSessions: [],
          messages: [],
          unreadMessageCount: 0,
          dashboardData: null,
          stats: null,
          loading: {
            profile: false,
            assignments: false,
            sessions: false,
            messages: false,
            dashboard: false,
            stats: false,
          },
          errors: {},
        });
      },
    }),
    {
      name: 'mentor-store',
    }
  )
);

export default useMentorStore; 