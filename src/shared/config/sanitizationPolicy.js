/**
 * Common Sanitization Policy
 *
 * This is the single source of truth for HTML sanitization rules.
 * It defines allowed tags, attributes, and URL protocols.
 *
 * This policy is designed to be mirrored on the .NET backend using
 * the HtmlSanitizer (Ganss.Xss) NuGet package with equivalent
 * configuration.
 *
 * IMPORTANT: Do NOT rely on default sanitization settings.
 * Always use this explicit policy.
 */

export const SANITIZATION_POLICY = {
  /**
   * Allowed HTML tags.
   * Only these tags will survive sanitization.
   * All other tags are stripped (content is kept).
   */
  ALLOWED_TAGS: [
    // Text structure
    'p', 'br', 'hr', 'div', 'span',
    // Inline text formatting
    'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Lists
    'ul', 'ol', 'li',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
    // Links and media
    'a', 'img',
  ],

  /**
   * Allowed HTML attributes.
   * Only these attributes will survive sanitization.
   * All on* event handlers are automatically blocked because
   * they are not in this whitelist.
   */
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'width', 'height',
    'class', 'style',
    'colspan', 'rowspan', 'scope',
    'target', 'rel',
  ],

  /**
   * Allowed URL protocols.
   * Only these protocols are permitted in href/src attributes.
   * javascript:, vbscript:, and data: are blocked.
   */
  ALLOWED_PROTOCOLS: ['http', 'https', 'mailto'],

  /**
   * Blocked tags (explicit documentation).
   * These are blocked by NOT being in the ALLOWED_TAGS list.
   * This list documents what MUST NEVER be allowed.
   */
  BLOCKED_TAGS: [
    'script', 'iframe', 'object', 'embed', 'form',
    'input', 'textarea', 'select', 'button',
    'link', 'meta', 'base', 'style',
  ],

  /**
   * Blocked attribute patterns (explicit documentation).
   * These are blocked by NOT being in the ALLOWED_ATTR list.
   * DOMPurify does NOT support wildcard patterns like 'on*' in FORBID_ATTR.
   * The whitelist approach (ALLOWED_ATTR) handles this automatically.
   */
  BLOCKED_ATTRIBUTE_PATTERNS: ['on*'],

  /**
   * Blocked URL protocols (explicit documentation).
   */
  BLOCKED_PROTOCOLS: ['javascript:', 'vbscript:', 'data:'],
};
