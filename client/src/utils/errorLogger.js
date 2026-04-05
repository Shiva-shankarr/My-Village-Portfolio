// Error logging utility
const errorLogger = {
  init() {
    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      this.logError('window.onerror', { message, source, lineno, colno, error });
    };

    // Unhandled promise rejection handler
    window.onunhandledrejection = (event) => {
      this.logError('unhandledrejection', {
        reason: event.reason,
        promise: event.promise
      });
    };
  },

  logError(type, error) {
    const errorData = {
      type,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      error: this.sanitizeError(error)
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorData);
    }

    // Send to your preferred error tracking service
    // Example: Sentry, LogRocket, etc.
    this.sendToErrorService(errorData);

    // Store in localStorage for debugging
    this.storeErrorLocally(errorData);
  },

  sanitizeError(error) {
    // Remove sensitive information
    const sanitized = { ...error };
    const sensitiveKeys = ['password', 'token', 'auth', 'key'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  },

  async sendToErrorService(errorData) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/error-logging`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      });

      if (!response.ok) {
        console.error('Failed to send error to logging service');
      }
    } catch (err) {
      console.error('Error sending to logging service:', err);
    }
  },

  storeErrorLocally(errorData) {
    try {
      const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      errors.push(errorData);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.shift();
      }
      
      localStorage.setItem('error_logs', JSON.stringify(errors));
    } catch (err) {
      console.error('Error storing error locally:', err);
    }
  },

  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch {
      return [];
    }
  },

  clearStoredErrors() {
    localStorage.removeItem('error_logs');
  }
};

export default errorLogger; 
