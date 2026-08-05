import { useCallback } from 'react';
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showPromise,
  dismiss,
  dismissAll,
} from './notificationService';

/**
 * useNotification Hook
 * 
 * A React hook that provides notification methods for components.
 * This is the preferred way to use notifications in React components.
 * 
 * Usage:
 * const { showSuccess, showError, showWarning, showInfo } = useNotification();
 * 
 * showSuccess('Ticket created successfully.');
 * showError('Failed to load data.');
 * showWarning('Please check your input.');
 * showInfo('Session expiring soon.');
 */

export const useNotification = () => {
  /**
   * Show a success notification
   * @param {string} message - The success message to display
   * @param {object} options - Optional Sonner configuration
   */
  const success = useCallback((message, options) => {
    return showSuccess(message, options);
  }, []);

  /**
   * Show an error notification
   * @param {string} message - The error message to display
   * @param {object} options - Optional Sonner configuration
   */
  const error = useCallback((message, options) => {
    return showError(message, options);
  }, []);

  /**
   * Show a warning notification
   * @param {string} message - The warning message to display
   * @param {object} options - Optional Sonner configuration
   */
  const warning = useCallback((message, options) => {
    return showWarning(message, options);
  }, []);

  /**
   * Show an info notification
   * @param {string} message - The info message to display
   * @param {object} options - Optional Sonner configuration
   */
  const info = useCallback((message, options) => {
    return showInfo(message, options);
  }, []);

  /**
   * Show a notification promise (for async operations)
   * @param {Promise} promise - The promise to track
   * @param {object} messages - Messages for loading, success, error states
   */
  const promise = useCallback((promise, messages) => {
    return showPromise(promise, messages);
  }, []);

  /**
   * Dismiss all active notifications
   */
  const dismissAllToasts = useCallback(() => {
    return dismissAll();
  }, []);

  /**
   * Dismiss a specific notification by ID
   * @param {string|number} toastId - The ID of the toast to dismiss
   */
  const dismissToast = useCallback((toastId) => {
    return dismiss(toastId);
  }, []);

  return {
    showSuccess: success,
    showError: error,
    showWarning: warning,
    showInfo: info,
    showPromise: promise,
    dismissAll: dismissAllToasts,
    dismiss: dismissToast,
  };
};

export default useNotification;
