/**
 * Email Notification Orchestration
 *
 * Centralized module that handles all ticket-related email notifications.
 * Follows the Email Notification Matrix exactly:
 *
 *   Trigger                         | TO              | CC                        | Vendor Mail
 *   ────────────────────────────────┼─────────────────┼───────────────────────────┼────────────
 *   Ticket Created                  | VHD             | Vendor                    | YES
 *   Ticket Assigned/Reassigned      | Assigned Person | VHD                       | NO
 *   VHD → Dept User L1              | Assigned Person | VHD                       | NO
 *   Dept User L1 → L2/L2→L3/L3→L4  | Next Level User | VHD + Previous Level User | NO
 *   Department Response             | Vendor + VHD    | Dept User                 | NO
 *   VHD Clarification Required      | Vendor          | VHD                       | YES
 *   Vendor Clarification Received   | VHD             | Vendor                    | YES
 *   Resolved                        | VHD             | Dept User L1/BL1          | NO
 *   Closed                          | Vendor          | VHD                       | YES
 *   Reopened                        | VHD             | Vendor                    | YES
 *
 * Architecture:
 *   1. Notification type constants
 *   2. Recipient resolution (pure function)
 *   3. Email body/subject templates (pure functions)
 *   4. sendNotification() orchestrator (fire-and-forget)
 *
 * Reuses:
 *   - mailService for sending (supports array emailId and cc)
 *   - sanitizeHtml (via mailService) for body sanitization
 *   - formatTicketNo for VHD ticket number formatting
 *   - VHD_EMAILS from appConfig for the centralized VHD email list
 *   - APP_URL from appConfig for the centralized application URL
 */

import { VHD_EMAILS, APP_URL } from '../config/appConfig.js';
import { mailService } from './mailService.js';
import { formatTicketNo } from '../utils/ticket.js';

// ─── Notification Types ───

export const NOTIFICATION_TYPES = {
  TICKET_CREATED: 'TICKET_CREATED',
  ASSIGNED: 'ASSIGNED',
  VHD_TO_DEPT_L1: 'VHD_TO_DEPT_L1',
  DEPT_L1_TO_L2: 'DEPT_L1_TO_L2',
  DEPT_L2_TO_L3: 'DEPT_L2_TO_L3',
  DEPT_L3_TO_L4: 'DEPT_L3_TO_L4',
  DEPT_RESPONSE: 'DEPT_RESPONSE',
  CLARIFICATION_REQUIRED: 'CLARIFICATION_REQUIRED',
  CLARIFICATION_RECEIVED: 'CLARIFICATION_RECEIVED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
};

// ─── Helpers ───

/**
 * Extract a field value from ticket details sections by section title and field label.
 * @param {Array} sections - ticketDetails.sections array
 * @param {string} sectionTitle - e.g., "Processing & Assignment"
 * @param {string} fieldLabel - e.g., "Assigned To Email"
 * @returns {string|null} The field value, or null if not found
 */
export function getSectionField(sections, sectionTitle, fieldLabel) {
  if (!sections || !Array.isArray(sections)) return null;
  const section = sections.find(s => s.title === sectionTitle);
  if (!section || !section.fields) return null;
  const field = section.fields.find(f => f.label === fieldLabel);
  return field?.value || null;
}

/**
 * Detect the notification type for a status change action.
 * @param {string} targetStatusText - The status being set (e.g., "Resolved")
 * @param {string} currentStatus - The current status before change (e.g., "Closed")
 * @returns {string} Notification type from NOTIFICATION_TYPES
 */
export function detectStatusChangeType(targetStatusText, currentStatus) {
  const target = (targetStatusText || '').toLowerCase().trim();
  const current = (currentStatus || '').toLowerCase().trim();

  if (target === 'resolved') return NOTIFICATION_TYPES.RESOLVED;
  if (target === 'closed') return NOTIFICATION_TYPES.CLOSED;
  if (target === 'on hold') return NOTIFICATION_TYPES.CLARIFICATION_REQUIRED;
  if (current === 'closed' && (target === 'open' || target === 'in progress')) {
    return NOTIFICATION_TYPES.REOPENED;
  }
  return null;
}

// ─── Recipient Resolution ───

/**
 * Resolve TO and CC recipients for a given notification type.
 *
 * Returns arrays for both to and cc. The orchestrator will deduplicate
 * and flatten before passing to mailService.
 *
 * VHD_EMAILS is always used as the centralized VHD recipient list.
 * "VHD" in the matrix means BOTH support@lhsindia.com AND vendorhelpdesktsuisl@tatasteel.com.
 *
 * @param {string} type - Notification type from NOTIFICATION_TYPES
 * @param {Object} context - Notification context data
 * @param {string} context.vendorEmail - Vendor's email address
 * @param {string} context.assignedEmail - Assigned person's email
 * @param {string} context.deptUserEmail - Department user's email (current user)
 * @param {string} context.prevLevelEmail - Previous escalation level user's email
 * @returns {{ to: string[], cc: string[] }} Resolved recipients as arrays
 */
function resolveRecipients(type, context) {
  const { vendorEmail, assignedEmail, deptUserEmail, prevLevelEmail } = context;

  switch (type) {
    case NOTIFICATION_TYPES.TICKET_CREATED:
      // TO: VHD | CC: Vendor
      return { to: [...VHD_EMAILS], cc: [vendorEmail].filter(Boolean) };

    case NOTIFICATION_TYPES.ASSIGNED:
      // TO: Assigned Person | CC: VHD
      return { to: [assignedEmail].filter(Boolean), cc: [...VHD_EMAILS] };

    case NOTIFICATION_TYPES.VHD_TO_DEPT_L1:
      // TO: Assigned Person (Dept User L1) | CC: VHD
      return { to: [assignedEmail].filter(Boolean), cc: [...VHD_EMAILS] };

    case NOTIFICATION_TYPES.DEPT_L1_TO_L2:
      // TO: Dept User L2 | CC: VHD + Dept User L1
      return {
        to: [assignedEmail].filter(Boolean),
        cc: [...VHD_EMAILS, prevLevelEmail].filter(Boolean),
      };

    case NOTIFICATION_TYPES.DEPT_L2_TO_L3:
      // TO: Dept User L3 | CC: VHD + Dept User L2
      return {
        to: [assignedEmail].filter(Boolean),
        cc: [...VHD_EMAILS, prevLevelEmail].filter(Boolean),
      };

    case NOTIFICATION_TYPES.DEPT_L3_TO_L4:
      // TO: Dept User L4 | CC: VHD + Dept User L3
      return {
        to: [assignedEmail].filter(Boolean),
        cc: [...VHD_EMAILS, prevLevelEmail].filter(Boolean),
      };

    case NOTIFICATION_TYPES.DEPT_RESPONSE:
      // TO: Vendor + VHD | CC: Dept User
      return {
        to: [vendorEmail, ...VHD_EMAILS].filter(Boolean),
        cc: [deptUserEmail].filter(Boolean),
      };

    case NOTIFICATION_TYPES.CLARIFICATION_REQUIRED:
      // VHD Clarification Required: TO: Vendor | CC: VHD
      return {
        to: [vendorEmail].filter(Boolean),
        cc: [...VHD_EMAILS],
      };

    case NOTIFICATION_TYPES.CLARIFICATION_RECEIVED:
      // Vendor Clarification Received: TO: VHD | CC: Vendor
      return {
        to: [...VHD_EMAILS],
        cc: [vendorEmail].filter(Boolean),
      };

    case NOTIFICATION_TYPES.RESOLVED:
      // TO: VHD | CC: Dept User Level 1 / BL1
      return {
        to: [...VHD_EMAILS],
        cc: [deptUserEmail].filter(Boolean),
      };

    case NOTIFICATION_TYPES.CLOSED:
      // TO: Vendor | CC: VHD
      return {
        to: [vendorEmail].filter(Boolean),
        cc: [...VHD_EMAILS],
      };

    case NOTIFICATION_TYPES.REOPENED:
      // TO: VHD | CC: Vendor
      return {
        to: [...VHD_EMAILS],
        cc: [vendorEmail].filter(Boolean),
      };

    default:
      return { to: [], cc: [] };
  }
}

// ─── Email Templates ───

/**
 * Build the email subject line for a notification.
 * Uses the exact subject wording from the Email Notification Matrix.
 * @param {string} type - Notification type
 * @param {Object} context - { ticketNo, ticketId }
 * @returns {string} Subject line
 */
function buildSubject(type, context) {
  const ticketNo = formatTicketNo(context.ticketNo) || `#${context.ticketId}`;

  const subjects = {
    [NOTIFICATION_TYPES.TICKET_CREATED]: `Ticket No ${ticketNo} – Action Required`,
    [NOTIFICATION_TYPES.ASSIGNED]: `Ticket No ${ticketNo} – Assigned for Action`,
    [NOTIFICATION_TYPES.VHD_TO_DEPT_L1]: `Ticket No ${ticketNo} – Action Required`,
    [NOTIFICATION_TYPES.DEPT_L1_TO_L2]: `Ticket No ${ticketNo} – Action Required`,
    [NOTIFICATION_TYPES.DEPT_L2_TO_L3]: `Ticket No ${ticketNo} – Action Required`,
    [NOTIFICATION_TYPES.DEPT_L3_TO_L4]: `Ticket No ${ticketNo} – Action Required`,
    [NOTIFICATION_TYPES.DEPT_RESPONSE]: `Ticket No ${ticketNo} – Response/Update Available`,
    [NOTIFICATION_TYPES.CLARIFICATION_REQUIRED]: `Ticket No ${ticketNo} – Clarification Required`,
    [NOTIFICATION_TYPES.CLARIFICATION_RECEIVED]: `Ticket No ${ticketNo} – Clarification Received`,
    [NOTIFICATION_TYPES.RESOLVED]: `Ticket No ${ticketNo} – Resolved`,
    [NOTIFICATION_TYPES.CLOSED]: `Ticket No ${ticketNo} – Closed`,
    [NOTIFICATION_TYPES.REOPENED]: `Ticket No ${ticketNo} – Reopened – Action Required`,
  };

  return subjects[type] || `Ticket No ${ticketNo} – Notification`;
}

/**
 * Build the HTML email body for a notification.
 * Uses the exact body text from the Email Notification Matrix.
 * @param {string} type - Notification type
 * @param {Object} context - { ticketNo, ticketId }
 * @returns {string} HTML body
 */
function buildBody(type, context) {
  const ticketNo = formatTicketNo(context.ticketNo) || `#${context.ticketId}`;

  // Escape ticket number for safe HTML insertion
  const safeTicketNo = escapeHtml(ticketNo);
  // Application URL link
  const appLink = `<a href="${APP_URL}">${APP_URL}</a>`;

  const templates = {
    [NOTIFICATION_TYPES.TICKET_CREATED]: [
      `<p>A Ticket (${safeTicketNo}) has been raised/assigned and requires your action.</p>`,
      `<p>Please click the link below to view the query details and take the necessary action:</p>`,
      `<p>${appLink}</p>`,
    ].join(''),

    [NOTIFICATION_TYPES.ASSIGNED]: [
      `<p>Ticket <strong>${safeTicketNo}</strong> has been assigned to you.</p>`,
      `<p>Please click the link below to view the details:</p>`,
      `<p>${appLink}</p>`,
    ].join(''),

    [NOTIFICATION_TYPES.VHD_TO_DEPT_L1]: [
      `<p>A Ticket (${safeTicketNo}) has been escalated to your level due to non-resolution within the defined SLA.</p>`,
      `<p>Please click the link below to review the query and take the necessary action:</p>`,
      `<p>${appLink}</p>`,
    ].join(''),

    [NOTIFICATION_TYPES.DEPT_L1_TO_L2]: [
      `<p>Ticket <strong>${safeTicketNo}</strong> has been escalated to you.</p>`,
      `<p>Please click the link below to view the details:</p>`,
      `<p>${appLink}</p>`,
    ].join(''),

    [NOTIFICATION_TYPES.DEPT_L2_TO_L3]: [
      `<p>Ticket <strong>${safeTicketNo}</strong> has been escalated to you.</p>`,
      `<p>Please click the link below to view the details:</p>`,
      `<p>${appLink}</p>`,
    ].join(''),

    [NOTIFICATION_TYPES.DEPT_L3_TO_L4]: [
      `<p>Ticket <strong>${safeTicketNo}</strong> has been escalated to you.</p>`,
      `<p>Please click the link below to view the details:</p>`,
      `<p>${appLink}</p>`,
    ].join(''),

    [NOTIFICATION_TYPES.DEPT_RESPONSE]: [
      `<p>An update/response has been provided against a Ticket (${safeTicketNo}).</p>`,
      `<p>Please click the link below to view the details:</p>`,
      `<p>${appLink}</p>`,
    ].join(''),

    [NOTIFICATION_TYPES.CLARIFICATION_REQUIRED]: [
      `<p>Additional clarification/information is required for a Ticket (${safeTicketNo}).</p>`,
      `<p>Please click the link below to view the query and provide the required information:</p>`,
      `<p>${appLink}</p>`,
    ].join(''),

    [NOTIFICATION_TYPES.CLARIFICATION_RECEIVED]: [
      `<p>The requested clarification/information has been received for a Ticket (${safeTicketNo}).</p>`,
      `<p>Please click the link below to view the details and proceed with the necessary action:</p>`,
      `<p>${appLink}</p>`,
    ].join(''),

    [NOTIFICATION_TYPES.RESOLVED]: [
      `<p>A Ticket (${safeTicketNo}) has been marked as resolved.</p>`,
      `<p>Please click the link below to view the resolution details:</p>`,
      `<p>${appLink}</p>`,
    ].join(''),

    [NOTIFICATION_TYPES.CLOSED]: [
      `<p>A Ticket (${safeTicketNo}) has been closed.</p>`,
      `<p>Please click the link below to view the query details:</p>`,
      `<p>${appLink}</p>`,
    ].join(''),

    [NOTIFICATION_TYPES.REOPENED]: [
      `<p>A Ticket (${safeTicketNo}) has been reopened and requires your attention.</p>`,
      `<p>Please click the link below to review the query and take the necessary action:</p>`,
      `<p>${appLink}</p>`,
    ].join(''),
  };

  return templates[type] || `<p>Ticket <strong>${safeTicketNo}</strong> has been updated.</p>`;
}

/**
 * Basic HTML escaping for dynamic content in email templates.
 * The mailService also sanitizes via DOMPurify, but this prevents
 * raw HTML injection in template construction.
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Deduplication ───

/**
 * Deduplicate email addresses across TO and CC.
 * If an email appears in both TO and CC, it is kept only in TO.
 * Empty/null/undefined entries are removed.
 * @param {string[]} to
 * @param {string[]} cc
 * @returns {{ to: string[], cc: string[] }}
 */
function deduplicateRecipients(to, cc) {
  const seen = new Set();
  const cleanTo = [];

  for (const email of to) {
    if (!email || typeof email !== 'string') continue;
    const trimmed = email.trim().toLowerCase();
    if (trimmed.length === 0 || seen.has(trimmed)) continue;
    seen.add(trimmed);
    cleanTo.push(email.trim());
  }

  const cleanCc = [];
  for (const email of cc) {
    if (!email || typeof email !== 'string') continue;
    const trimmed = email.trim().toLowerCase();
    if (trimmed.length === 0 || seen.has(trimmed)) continue;
    seen.add(trimmed);
    cleanCc.push(email.trim());
  }

  return { to: cleanTo, cc: cleanCc };
}

// ─── Main Send Function ───

/**
 * Send an email notification for a ticket event.
 *
 * This function is fire-and-forget — it never throws.
 * Email failures are caught and logged without affecting the ticket workflow.
 *
 * @param {string} type - Notification type from NOTIFICATION_TYPES
 * @param {Object} context - Notification context
 * @param {string} [context.ticketNo] - Ticket number (raw, before formatting)
 * @param {number|string} [context.ticketId] - Ticket ID (fallback for subject)
 * @param {string} [context.subject] - Ticket subject (unused in matrix subjects, kept for compatibility)
 * @param {string} [context.status] - Current/target status text (unused in matrix bodies, kept for compatibility)
 * @param {string} [context.priority] - Ticket priority (unused in matrix bodies, kept for compatibility)
 * @param {string} [context.remarks] - Status change remarks (unused in matrix bodies, kept for compatibility)
 * @param {string} [context.vendorEmail] - Vendor's email address
 * @param {string} [context.assignedEmail] - Assigned person's email
 * @param {string} [context.deptUserEmail] - Department user's email (current user)
 * @param {string} [context.prevLevelEmail] - Previous escalation level user's email
 * @returns {Promise<void>}
 */
export async function sendNotification(type, context = {}) {
  try {
    const { to, cc } = resolveRecipients(type, context);

    // Deduplicate across TO and CC
    const { to: cleanTo, cc: cleanCc } = deduplicateRecipients(to, cc);

    // Skip if no valid TO recipient
    if (cleanTo.length === 0) {
      console.warn(`[EmailNotification] Skipping ${type}: no recipient email available`);
      return;
    }

    const subject = buildSubject(type, context);
    const body = buildBody(type, context);

    // mailService now supports array emailId — pass arrays directly
    // If only one TO, pass as string for backward compatibility
    const toParam = cleanTo.length === 1 ? cleanTo[0] : cleanTo;

    // cc can be empty array — pass undefined if empty
    const ccParam = cleanCc.length > 0 ? cleanCc : undefined;

    await mailService.sendMail({ emailId: toParam, subject, body, cc: ccParam });
  } catch (err) {
    // Email failure must never break the ticket workflow
    console.warn(`[EmailNotification] Failed to send ${type}:`, err);
  }
}
