import DOMPurify from 'dompurify';
import { SANITIZATION_POLICY } from '../config/sanitizationPolicy.js';

/**
 * Centralized HTML Sanitization Utility
 *
 * Wraps DOMPurify with the common sanitization policy.
 * All HTML sanitization in the application should go through this function.
 *
 * Usage:
 *   import { sanitizeHtml } from '@/shared/utils/sanitize';
 *   const clean = sanitizeHtml('<p>Hello <script>alert(1)</script></p>');
 *   // → '<p>Hello </p>'
 *
 * NOTE: DOMPurify does NOT support wildcard patterns like 'on*' in FORBID_ATTR.
 * Event handlers (onclick, onerror, etc.) are blocked by the whitelist approach:
 * they are not in ALLOWED_ATTR, so DOMPurify removes them automatically.
 */

// Build a regex from the allowed protocols for ALLOWED_URI_REGEXP
const protocolPattern = SANITIZATION_POLICY.ALLOWED_PROTOCOLS.join('|');
const protocolRegex = new RegExp(
  `^(?:(?:(?:f|ht)tps?|${protocolPattern}):|[^a-z]|[a-z+.\\-]+(?:[^a-z+.\\-:]|$))`,
  'i'
);

// DOMPurify configuration — built from the common policy
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: SANITIZATION_POLICY.ALLOWED_TAGS,
  ALLOWED_ATTR: SANITIZATION_POLICY.ALLOWED_ATTR,
  ALLOWED_URI_REGEXP: protocolRegex,
  // Never allow unknown protocols (javascript:, vbscript:, data: are blocked)
  ALLOW_UNKNOWN_PROTOCOLS: false,
  // Strip data-* attributes (not needed for email content)
  ALLOW_DATA_ATTR: false,
  // ARIA attributes are not needed for email content
  ALLOW_ARIA_ATTR: false,
};

/**
 * Sanitize HTML content using DOMPurify with the common policy.
 *
 * - Preserves approved HTML formatting (p, strong, table, etc.)
 * - Removes dangerous HTML/XSS content (script, iframe, on* handlers, etc.)
 * - Blocks dangerous URL protocols (javascript:, vbscript:, data:)
 *
 * @param {string} dirty - Untrusted HTML string
 * @returns {string} Sanitized HTML string
 */
export function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, DOMPURIFY_CONFIG);
}

export default sanitizeHtml;
