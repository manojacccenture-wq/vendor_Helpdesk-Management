/**
 * Notifications Module
 * 
 * Centralized notification system for the application.
 * 
 * Usage:
 * 
 * // In React components (preferred):
 * import { useNotification } from '@/shared/notifications';
 * const { showSuccess, showError } = useNotification();
 * 
 * // In non-React contexts (API interceptors, services):
 * import { notificationService } from '@/shared/notifications';
 * notificationService.success('Operation completed');
 * 
 * // For providers setup:
 * import { NotificationProvider } from '@/shared/notifications';
 */

// Provider component - wrap app once
export { NotificationProvider } from './NotificationProvider.jsx';

// React hook - for components
export { useNotification } from './useNotification.js';

// Service - for non-React contexts
export {
  notificationService as default,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showPromise,
  dismiss,
  dismissAll,
} from './notificationService.js';

// Named export for service
export { notificationService } from './notificationService.js';
