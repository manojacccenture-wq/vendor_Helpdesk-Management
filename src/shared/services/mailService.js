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
 *     emailId: 'user@example.com',        // single recipient
 *     emailId: ['a@x.com', 'b@x.com'],   // multiple recipients (joined with comma)
 *     subject: 'Ticket Created',
 *     body: '<p>Your ticket has been created.</p>',
 *     cc: 'manager@example.com'            // optional, string or array
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

/**
 * Validate and deduplicate an email list (string or array).
 * Returns a comma-separated string of valid, trimmed, unique emails.
 * @param {string|string[]|undefined|null} emails
 * @returns {string} Comma-separated valid emails, or empty string
 */
function resolveEmailList(emails) {
  if (!emails) return '';

  const list = Array.isArray(emails) ? emails : [emails];
  const valid = [];
  const seen = new Set();

  for (const entry of list) {
    if (!entry || typeof entry !== 'string') continue;
    const trimmed = entry.trim();
    if (trimmed.length === 0) continue;

    // Handle comma-separated strings within array entries
    const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
    for (const part of parts) {
      if (isValidEmail(part) && !seen.has(part.toLowerCase())) {
        seen.add(part.toLowerCase());
        valid.push(part);
      }
    }
  }

  return valid.join(',');
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
   * @param {string|string[]} params.emailId - Recipient email address(es) for TO.
   *   String for single recipient, array for multiple recipients (joined with comma).
   * @param {string} params.subject - Email subject line (validated, no newlines)
   * @param {string} params.body    - HTML email body (sanitized via DOMPurify)
   * @param {string|string[]} [params.cc] - Optional CC email address(es). String for single, array for multiple.
   * @returns {Promise<any>} API response data
   * @throws {Error} If required parameters fail validation or no valid recipients
   */
  sendMail: async ({ emailId, subject, body, cc }) => {
    // --- Validate and resolve TO recipients ---
    const toValue = resolveEmailList(emailId);
    if (!toValue) {
      throw new Error('No valid recipient email address provided');
    }

    // --- Validate required fields ---
    if (!isValidSubject(subject)) {
      throw new Error('Invalid email subject');
    }
    if (!body || typeof body !== 'string') {
      throw new Error('Email body is required');
    }

    // --- Validate and resolve CC recipients ---
    const ccValue = resolveEmailList(cc);

    // --- Sanitize HTML body ---
    const cleanBody = sanitizeHtml(body);

    // --- Build query parameters ---
    const params = new URLSearchParams();
    params.append('emailId', toValue);
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
