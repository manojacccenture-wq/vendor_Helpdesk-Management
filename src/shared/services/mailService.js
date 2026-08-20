import { axiosClient } from '../api/index.js';
import { sanitizeHtml } from '../utils/sanitize.js';

/**
 * Centralized Mail Service
 *
 * Sends email notifications via the vendor helpdesk mail API.
 * Automatically validates and sanitizes all parameters before sending.
 *
 * This service is generic and unaware of which business event triggered it.
 *
 * Usage:
 *   import { mailService } from '@/shared/services';
 *   await mailService.sendMail({
 *     emailId: 'user@example.com',
 *     subject: 'Ticket Created',
 *     body: '<p>Your ticket has been created.</p>',
 *     cc: 'manager@example.com'  // optional
 *   });
 */

// --- Validation Constants ---

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 998;

// --- Validation Helpers ---

/**
 * Validate an email address.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_EMAIL_LENGTH) return false;
  if (/\r|\n/.test(trimmed)) return false;
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Validate an email subject line.
 * Prevents header injection via newlines.
 * @param {string} subject
 * @returns {boolean}
 */
function isValidSubject(subject) {
  if (!subject || typeof subject !== 'string') return false;
  const trimmed = subject.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_SUBJECT_LENGTH) return false;
  if (/\r|\n/.test(trimmed)) return false;
  return true;
}

// --- Main Service ---

export const mailService = {
  /**
   * Send an email notification.
   *
   * All parameters are validated and the body is sanitized before the API call.
   * The service does not know which business event triggered the email.
   *
   * @param {Object} params
   * @param {string} params.emailId - Recipient email address (validated)
   * @param {string} params.subject - Email subject line (validated, no newlines)
   * @param {string} params.body    - HTML email body (sanitized via DOMPurify) * @param {string|string[]} [params.cc] - Optional CC email address(es). String for single, array for multiple.
 * @returns {Promise<any>} API response data
 * @throws {Error} If required parameters fail validation
 */
  sendMail: async ({ emailId, subject, body, cc }) => {
    // --- Validate required fields ---
    if (!isValidEmail(emailId)) {
      throw new Error('Invalid recipient email address');
    }
    if (!isValidSubject(subject)) {
      throw new Error('Invalid email subject');
    }
    if (!body || typeof body !== 'string') {
      throw new Error('Email body is required');
    }

    // --- Validate optional CC (single string or array of strings) ---
    let ccValue = '';
    if (cc !== undefined && cc !== null && cc !== '') {
      if (Array.isArray(cc)) {
        const validEmails = cc.filter(e => isValidEmail(e));
        if (validEmails.length > 0) {
          ccValue = validEmails.join(',');
        }
      } else {
        if (!isValidEmail(cc)) {
          throw new Error('Invalid CC email address');
        }
        ccValue = cc.trim();
      }
    }

    // --- Sanitize HTML body ---
    const cleanBody = sanitizeHtml(body);

    // --- Build query parameters ---
    const params = new URLSearchParams();
    params.append('emailId', emailId.trim());
    params.append('subject', subject.trim());
    params.append('body', cleanBody);
    if (ccValue) {
      params.append('cc', ccValue);
    }

    // --- Send request via existing axiosClient ---
    const response = await axiosClient.get(
      `/api/App/sendmail?${params.toString()}`
    );
    return response;
  },
};
