/**
 * Error Handling Service
 * Single Responsibility: Handle all error logging, reporting, and user feedback
 */
export class ErrorHandlingService {
  static errorLogs = [];
  static maxLogs = 100; // Keep last 100 errors

  /**
   * Log error with context
   */
  static logError(error, context = {}) {
    const errorEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: error.message || error,
      stack: error.stack,
      context,
      level: 'error'
    };

    this.errorLogs.unshift(errorEntry);
    
    // Keep only recent errors
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(0, this.maxLogs);
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error logged:', errorEntry);
    }

    return errorEntry.id;
  }

  /**
   * Log warning
   */
  static logWarning(message, context = {}) {
    const warningEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message,
      context,
      level: 'warning'
    };

    this.errorLogs.unshift(warningEntry);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Warning logged:', warningEntry);
    }

    return warningEntry.id;
  }

  /**
   * Handle authentication errors specifically
   */
  static handleAuthError(error, context = {}) {
    const authContext = {
      ...context,
      type: 'authentication',
      action: context.action || 'unknown_auth_action'
    };

    const errorId = this.logError(error, authContext);

    // User-friendly error messages
    const userMessage = this.getAuthErrorMessage(error);
    
    return {
      errorId,
      userMessage,
      shouldRetry: this.shouldRetryAuthError(error),
      shouldLogout: this.shouldLogoutOnError(error)
    };
  }

  /**
   * Handle role interface errors
   */
  static handleRoleError(error, roleName, context = {}) {
    const roleContext = {
      ...context,
      type: 'role_interface',
      roleName,
      action: context.action || 'role_rendering'
    };

    const errorId = this.logError(error, roleContext);

    return {
      errorId,
      userMessage: `There was an issue loading the ${roleName} interface. Please try refreshing the page.`,
      shouldFallback: true
    };
  }

  /**
   * Get user-friendly auth error message
   */
  static getAuthErrorMessage(error) {
    const message = error.message || error;
    
    if (message.includes('Network')) {
      return 'Network connection error. Please check your internet connection and try again.';
    }
    
    if (message.includes('401') || message.includes('Unauthorized')) {
      return 'Your session has expired. Please log in again.';
    }
    
    if (message.includes('403') || message.includes('Forbidden')) {
      return 'You do not have permission to access this resource.';
    }
    
    if (message.includes('Google')) {
      return 'Google authentication failed. Please try again or contact support.';
    }
    
    return 'Authentication failed. Please try again.';
  }

  /**
   * Determine if auth error should trigger retry
   */
  static shouldRetryAuthError(error) {
    const message = error.message || error;
    return message.includes('Network') || message.includes('timeout');
  }

  /**
   * Determine if error should trigger logout
   */
  static shouldLogoutOnError(error) {
    const message = error.message || error;
    return message.includes('401') || message.includes('Unauthorized') || 
           message.includes('invalid_token');
  }

  /**
   * Get error logs for debugging
   */
  static getErrorLogs(level = null, limit = 10) {
    let logs = this.errorLogs;
    
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    return logs.slice(0, limit);
  }

  /**
   * Clear error logs
   */
  static clearErrorLogs() {
    this.errorLogs = [];
  }

  /**
   * Export error logs for debugging
   */
  static exportErrorLogs() {
    return JSON.stringify(this.errorLogs, null, 2);
  }
}

export default ErrorHandlingService; 