import baseAPI from './baseAPI.js';
import { MENTOR_ENDPOINTS } from '../utils/constants.js';

class AssignmentAPI {
  /**
   * Get mentorship assignments with optional filters
   * @param {Object} filters - Filter parameters (role, status, cohort_id, etc.)
   * @returns {Promise} List of assignments
   */
  static async getAssignments(filters = {}) {
    return baseAPI.get(MENTOR_ENDPOINTS.ASSIGNMENTS, filters);
  }

  /**
   * Get specific assignment by ID
   * @param {number} id - Assignment ID
   * @returns {Promise} Assignment data
   */
  static async getAssignment(id) {
    return baseAPI.get(MENTOR_ENDPOINTS.ASSIGNMENT_DETAIL(id));
  }

  /**
   * Create new mentorship assignment
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise} Created assignment
   */
  static async createAssignment(assignmentData) {
    return baseAPI.post(MENTOR_ENDPOINTS.ASSIGNMENTS, assignmentData);
  }

  /**
   * Update assignment
   * @param {number} id - Assignment ID
   * @param {Object} assignmentData - Updated assignment data
   * @returns {Promise} Updated assignment
   */
  static async updateAssignment(id, assignmentData) {
    return baseAPI.patch(MENTOR_ENDPOINTS.ASSIGNMENT_DETAIL(id), assignmentData);
  }

  /**
   * Activate assignment
   * @param {number} id - Assignment ID
   * @returns {Promise} Updated assignment
   */
  static async activateAssignment(id) {
    return baseAPI.post(MENTOR_ENDPOINTS.ACTIVATE_ASSIGNMENT(id));
  }

  /**
   * Get assignments for current mentor
   * @param {Object} filters - Additional filters
   * @returns {Promise} List of mentor's assignments
   */
  static async getMentorAssignments(filters = {}) {
    return this.getAssignments({ role: 'mentor', ...filters });
  }

  /**
   * Get assignments for specific student
   * @param {number} studentId - Student ID
   * @param {Object} filters - Additional filters
   * @returns {Promise} List of student's assignments
   */
  static async getStudentAssignments(studentId, filters = {}) {
    return this.getAssignments({ student_id: studentId, ...filters });
  }

  /**
   * Get active assignments for mentor
   * @returns {Promise} List of active assignments
   */
  static async getActiveAssignments() {
    return this.getMentorAssignments({ status: 'active' });
  }

  /**
   * Get pending assignments for mentor
   * @returns {Promise} List of pending assignments
   */
  static async getPendingAssignments() {
    return this.getMentorAssignments({ status: 'pending' });
  }

  /**
   * Get completed assignments for mentor
   * @returns {Promise} List of completed assignments
   */
  static async getCompletedAssignments() {
    return this.getMentorAssignments({ status: 'completed' });
  }

  /**
   * Complete assignment
   * @param {number} id - Assignment ID
   * @returns {Promise} Updated assignment
   */
  static async completeAssignment(id) {
    return baseAPI.patch(MENTOR_ENDPOINTS.ASSIGNMENT_DETAIL(id), { status: 'completed' });
  }

  /**
   * Cancel assignment
   * @param {number} id - Assignment ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} Updated assignment
   */
  static async cancelAssignment(id, reason = '') {
    return baseAPI.patch(MENTOR_ENDPOINTS.ASSIGNMENT_DETAIL(id), { 
      status: 'cancelled',
      cancellation_reason: reason 
    });
  }

  /**
   * Pause assignment
   * @param {number} id - Assignment ID
   * @param {string} reason - Pause reason
   * @returns {Promise} Updated assignment
   */
  static async pauseAssignment(id, reason = '') {
    return baseAPI.patch(MENTOR_ENDPOINTS.ASSIGNMENT_DETAIL(id), { 
      status: 'paused',
      pause_reason: reason 
    });
  }
}

export default AssignmentAPI; 