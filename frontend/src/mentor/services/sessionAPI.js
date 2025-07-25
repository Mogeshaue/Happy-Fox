import baseAPI from './baseAPI.js';
import { MENTOR_ENDPOINTS } from '../utils/constants.js';

class SessionAPI {
  /**
   * Get sessions with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise} List of sessions
   */
  static async getSessions(filters = {}) {
    return baseAPI.get(MENTOR_ENDPOINTS.SESSIONS, filters);
  }

  /**
   * Get specific session by ID
   * @param {number} id - Session ID
   * @returns {Promise} Session data
   */
  static async getSession(id) {
    return baseAPI.get(MENTOR_ENDPOINTS.SESSION_DETAIL(id));
  }

  /**
   * Create new session
   * @param {Object} sessionData - Session data
   * @returns {Promise} Created session
   */
  static async createSession(sessionData) {
    return baseAPI.post(MENTOR_ENDPOINTS.SESSIONS, sessionData);
  }

  /**
   * Update session
   * @param {number} id - Session ID
   * @param {Object} sessionData - Updated session data
   * @returns {Promise} Updated session
   */
  static async updateSession(id, sessionData) {
    return baseAPI.patch(MENTOR_ENDPOINTS.SESSION_DETAIL(id), sessionData);
  }

  /**
   * Delete session
   * @param {number} id - Session ID
   * @returns {Promise} Deletion confirmation
   */
  static async deleteSession(id) {
    return baseAPI.delete(MENTOR_ENDPOINTS.SESSION_DETAIL(id));
  }

  /**
   * Get upcoming sessions for mentor
   * @returns {Promise} List of upcoming sessions
   */
  static async getUpcomingSessions() {
    const now = new Date().toISOString();
    return this.getSessions({ 
      scheduled_at__gte: now,
      status: 'scheduled'
    });
  }

  /**
   * Get past sessions for mentor
   * @returns {Promise} List of past sessions
   */
  static async getPastSessions() {
    const now = new Date().toISOString();
    return this.getSessions({ 
      scheduled_at__lt: now,
      status__in: ['completed', 'cancelled', 'no_show']
    });
  }

  /**
   * Get today's sessions
   * @returns {Promise} List of today's sessions
   */
  static async getTodaySessions() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    
    return this.getSessions({
      scheduled_at__gte: startOfDay,
      scheduled_at__lte: endOfDay
    });
  }

  /**
   * Get sessions for specific assignment
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise} List of sessions
   */
  static async getAssignmentSessions(assignmentId) {
    return this.getSessions({ assignment_id: assignmentId });
  }

  /**
   * Start session (mark as in progress)
   * @param {number} id - Session ID
   * @returns {Promise} Updated session
   */
  static async startSession(id) {
    return baseAPI.patch(MENTOR_ENDPOINTS.SESSION_DETAIL(id), { 
      status: 'in_progress' 
    });
  }

  /**
   * Complete session
   * @param {number} id - Session ID
   * @param {Object} completionData - Session completion data
   * @returns {Promise} Updated session
   */
  static async completeSession(id, completionData = {}) {
    return baseAPI.patch(MENTOR_ENDPOINTS.SESSION_DETAIL(id), {
      status: 'completed',
      ...completionData
    });
  }

  /**
   * Cancel session
   * @param {number} id - Session ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} Updated session
   */
  static async cancelSession(id, reason = '') {
    return baseAPI.patch(MENTOR_ENDPOINTS.SESSION_DETAIL(id), {
      status: 'cancelled',
      cancellation_reason: reason
    });
  }

  /**
   * Mark session as no-show
   * @param {number} id - Session ID
   * @returns {Promise} Updated session
   */
  static async markNoShow(id) {
    return baseAPI.patch(MENTOR_ENDPOINTS.SESSION_DETAIL(id), {
      status: 'no_show'
    });
  }

  /**
   * Rate session (from student perspective)
   * @param {number} id - Session ID
   * @param {number} rating - Rating (1-5)
   * @param {string} feedback - Optional feedback
   * @returns {Promise} Updated session
   */
  static async rateSession(id, rating, feedback = '') {
    return baseAPI.patch(MENTOR_ENDPOINTS.SESSION_DETAIL(id), {
      student_rating: rating,
      student_feedback: feedback
    });
  }
}

export default SessionAPI; 