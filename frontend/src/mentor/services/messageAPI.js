import baseAPI from './baseAPI.js';
import { MENTOR_ENDPOINTS } from '../utils/constants.js';

class MessageAPI {
  /**
   * Get messages with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise} List of messages
   */
  static async getMessages(filters = {}) {
    return baseAPI.get(MENTOR_ENDPOINTS.MESSAGES, filters);
  }

  /**
   * Send new message
   * @param {Object} messageData - Message data
   * @returns {Promise} Created message
   */
  static async sendMessage(messageData) {
    return baseAPI.post(MENTOR_ENDPOINTS.MESSAGES, messageData);
  }

  /**
   * Mark message as read
   * @param {number} id - Message ID
   * @returns {Promise} Updated message
   */
  static async markMessageAsRead(id) {
    return baseAPI.patch(MENTOR_ENDPOINTS.MARK_MESSAGE_READ(id), {
      is_read: true
    });
  }

  /**
   * Get messages for specific assignment
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise} List of messages
   */
  static async getAssignmentMessages(assignmentId) {
    return this.getMessages({ assignment_id: assignmentId });
  }

  /**
   * Get unread messages count
   * @returns {Promise} Unread messages count
   */
  static async getUnreadCount() {
    const response = await this.getMessages({ is_read: false });
    return response.count || response.length || 0;
  }

  /**
   * Get conversation thread
   * @param {number} assignmentId - Assignment ID
   * @param {number} limit - Number of messages to fetch
   * @param {number} offset - Offset for pagination
   * @returns {Promise} Messages in conversation
   */
  static async getConversation(assignmentId, limit = 50, offset = 0) {
    return this.getMessages({
      assignment_id: assignmentId,
      limit,
      offset,
      ordering: '-created_at'
    });
  }

  /**
   * Send text message
   * @param {number} assignmentId - Assignment ID
   * @param {string} content - Message content
   * @param {number} replyToId - Optional reply to message ID
   * @returns {Promise} Created message
   */
  static async sendTextMessage(assignmentId, content, replyToId = null) {
    return this.sendMessage({
      assignment_id: assignmentId,
      message_type: 'text',
      content,
      reply_to: replyToId
    });
  }

  /**
   * Send file message
   * @param {number} assignmentId - Assignment ID
   * @param {string} fileUrl - File URL
   * @param {string} fileName - File name
   * @param {string} description - Optional description
   * @returns {Promise} Created message
   */
  static async sendFileMessage(assignmentId, fileUrl, fileName, description = '') {
    return this.sendMessage({
      assignment_id: assignmentId,
      message_type: 'file',
      content: description || fileName,
      file_url: fileUrl,
      metadata: { file_name: fileName }
    });
  }

  /**
   * Send link message
   * @param {number} assignmentId - Assignment ID
   * @param {string} url - Link URL
   * @param {string} title - Link title
   * @param {string} description - Optional description
   * @returns {Promise} Created message
   */
  static async sendLinkMessage(assignmentId, url, title, description = '') {
    return this.sendMessage({
      assignment_id: assignmentId,
      message_type: 'link',
      content: description || title,
      file_url: url,
      metadata: { link_title: title }
    });
  }

  /**
   * Send task feedback message
   * @param {number} assignmentId - Assignment ID
   * @param {string} feedback - Feedback content
   * @param {number} taskId - Task ID
   * @param {number} score - Optional score
   * @returns {Promise} Created message
   */
  static async sendTaskFeedback(assignmentId, feedback, taskId, score = null) {
    return this.sendMessage({
      assignment_id: assignmentId,
      message_type: 'task_feedback',
      content: feedback,
      metadata: { 
        task_id: taskId,
        score: score
      }
    });
  }

  /**
   * Mark multiple messages as read
   * @param {Array} messageIds - Array of message IDs
   * @returns {Promise} Array of updated messages
   */
  static async markMultipleAsRead(messageIds) {
    const promises = messageIds.map(id => this.markMessageAsRead(id));
    return Promise.all(promises);
  }

  /**
   * Search messages
   * @param {string} query - Search query
   * @param {number} assignmentId - Optional assignment ID
   * @returns {Promise} Search results
   */
  static async searchMessages(query, assignmentId = null) {
    const filters = { search: query };
    if (assignmentId) {
      filters.assignment_id = assignmentId;
    }
    return this.getMessages(filters);
  }
}

export default MessageAPI; 