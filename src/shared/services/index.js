/**
 * Shared Services Module
 *
 * Centralized, reusable services that abstract API communication.
 * Services are framework-agnostic and can be used in React components,
 * Redux thunks, or any non-React context.
 *
 * Usage:
 *   import { mailService } from '@/shared/services';
 *   await mailService.sendMail({ emailId, subject, body, cc });
 */
export { mailService } from './mailService.js';
