import baseAPI from './baseAPI.js';
import { MENTOR_ENDPOINTS } from '../utils/constants.js';

class MentorAPI {
  /**
   * Get mentor profiles with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise} List of mentor profiles
   */
  static async getMentorProfiles(filters = {}) {
    return baseAPI.get(MENTOR_ENDPOINTS.MENTOR_PROFILES, filters);
  }

  /**
   * Get current mentor's profile
   * @returns {Promise} Mentor profile data
   */
  static async getMyProfile() {
    return baseAPI.get(MENTOR_ENDPOINTS.MY_PROFILE);
  }

  /**
   * Get specific mentor profile by ID
   * @param {number} id - Mentor profile ID
   * @returns {Promise} Mentor profile data
   */
  static async getMentorProfile(id) {
    return baseAPI.get(`${MENTOR_ENDPOINTS.MENTOR_PROFILES}/${id}`);
  }

  /**
   * Create new mentor profile
   * @param {Object} profileData - Mentor profile data
   * @returns {Promise} Created profile data
   */
  static async createMentorProfile(profileData) {
    return baseAPI.post(MENTOR_ENDPOINTS.CREATE_PROFILE, profileData);
  }

  /**
   * Update mentor profile
   * @param {number} id - Mentor profile ID
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} Updated profile data
   */
  static async updateMentorProfile(id, profileData) {
    const endpoint = id ? `${MENTOR_ENDPOINTS.MENTOR_PROFILES}/${id}` : MENTOR_ENDPOINTS.MY_PROFILE;
    return baseAPI.patch(endpoint, profileData);
  }

  /**
   * Get mentor dashboard data
   * @returns {Promise} Dashboard data
   */
  static async getDashboardData() {
    return baseAPI.get(MENTOR_ENDPOINTS.DASHBOARD);
  }

  /**
   * Get mentor statistics
   * @returns {Promise} Statistics data
   */
  static async getMentorStats() {
    return baseAPI.get(MENTOR_ENDPOINTS.MENTOR_STATS);
  }

  /**
   * Get students assigned to mentor
   * @returns {Promise} List of students
   */
  static async getMentorStudents() {
    return baseAPI.get(MENTOR_ENDPOINTS.MENTOR_STUDENTS);
  }

  /**
   * Get available mentors
   * @param {Object} filters - Filter parameters
   * @returns {Promise} List of available mentors
   */
  static async getAvailableMentors(filters = {}) {
    return baseAPI.get(MENTOR_ENDPOINTS.AVAILABLE_MENTORS, filters);
  }

  /**
   * Get mentor availability
   * @param {number} mentorId - Mentor ID
   * @returns {Promise} Availability data
   */
  static async getMentorAvailability(mentorId) {
    return baseAPI.get(MENTOR_ENDPOINTS.MENTOR_AVAILABILITY(mentorId));
  }

  /**
   * Update mentor availability
   * @param {number} mentorId - Mentor ID
   * @param {Object} availabilityData - Availability schedule
   * @returns {Promise} Updated availability
   */
  static async updateMentorAvailability(mentorId, availabilityData) {
    return baseAPI.patch(MENTOR_ENDPOINTS.MENTOR_AVAILABILITY(mentorId), availabilityData);
  }
}

export default MentorAPI; 