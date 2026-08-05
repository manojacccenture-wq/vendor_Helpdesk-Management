import { toast } from 'sonner';

/**
 * Centralized Notification Service
 * 
 * This service provides a abstraction layer over Sonner toast library.
 * All notification calls throughout the application should use this service
 * instead of importing toast directly from sonner.
 * 
 * Benefits:
 * - Library independence: Swap Sonner for any other library by changing only this file
 * - Consistent API: All components use the same notification methods
 * - Easy maintenance: Notification behavior can be modified in one place
 */

const TOAST_DURATION = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
};

/**
 * Show a success notification
 * @param {string} message - The success message to display
 * @param {object} options - Optional configuration
 */
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    duration: TOAST_DURATION.success,
    ...options,
  });
};

/**
 * Show an error notification
 * @param {string} message - The error message to display
 * @param {object} options - Optional configuration
 */
export const showError = (message, options = {}) => {
  return toast.error(message, {
    duration: TOAST_DURATION.error,
    ...options,
  });
};

/**
 * Show a warning notification
 * @param {string} message - The warning message to display
 * @param {object} options - Optional configuration
 */
export const showWarning = (message, options = {}) => {
  return toast.warning(message, {
    duration: TOAST_DURATION.warning,
    ...options,
  });
};

/**
 * Show an info notification
 * @param {string} message - The info message to display
 * @param {object} options - Optional configuration
 */
export const showInfo = (message, options = {}) => {
  return toast.info(message, {
    duration: TOAST_DURATION.info,
    ...options,
  });
};

/**
 * Show a notification promise (for async operations)
 * @param {Promise} promise - The promise to track
 * @param {object} messages - Messages for loading, success, error states
 */
export const showPromise = (promise, messages) => {
  return toast.promise(promise, messages);
};

/**
 * Dismiss all active notifications
 */
export const dismissAll = () => {
  return toast.dismiss();
};

/**
 * Dismiss a specific notification by ID
 * @param {string|number} toastId - The ID of the toast to dismiss
 */
export const dismiss = (toastId) => {
  return toast.dismiss(toastId);
};

// Export the notification service as default and named exports
export const notificationService = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  promise: showPromise,
  dismiss,
  dismissAll,
};

export default notificationService;
