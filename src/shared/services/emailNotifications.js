/**
 * Email Notification Orchestration
 *
 * Centralized module that handles all ticket-related email notifications.
 * Follows the Email Notification Matrix:
 *
 *   Trigger                         | TO              | CC                        | Vendor Mail
 *   ────────────────────────────────┼─────────────────┼───────────────────────────┼────────────
 *   Ticket Created                  | VHD             | Vendor                    | YES
 *   Ticket Assigned/Reassigned      | Assigned Person | VHD                       | NO
 *   VHD → Dept User L1              | Assigned Person | VHD                       | NO
 *   Dept User L1 → Dept User L2     | Dept User L2    | VHD + Dept User L1        | NO
 *   Dept User L2 → Dept User L3     | Dept User L3    | VHD + Dept User L2        | NO
 *   Dept User L3 → Dept User L4     | Dept User L4    | VHD + Dept User L3        | NO
 *   Department Response             | VHD             | Dept User                 | NO
 *   Vendor Clarification Required   | Vendor          | VHD                       | YES
 *   Vendor Clarification Received   | VHD             | Vendor                    | YES
 *   Resolved                        | Dept User       | VHD                       | NO
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
 *   - mailService for sending
 *   - sanitizeHtml (via mailService) for body sanitization
 *   - formatTicketNo for VHD ticket number formatting
 *   - VHD_EMAIL from appConfig for the centralized VHD email
 */

import { VHD_EMAIL } from '../config/appConfig.js';
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
 * @param {string} type - Notification type from NOTIFICATION_TYPES
 * @param {Object} context - Notification context data
 * @param {string} context.vendorEmail - Vendor's email address
 * @param {string} context.assignedEmail - Assigned person's email
 * @param {string} context.deptUserEmail - Department user's email (current user)
 * @param {string} context.prevLevelEmail - Previous escalation level user's email
 * @returns {{ to: string|null, cc: string|string[]|null }} Resolved recipients (cc may be array for multi-CC)
 */
function resolveRecipients(type, context) {
  const { vendorEmail, assignedEmail, deptUserEmail, prevLevelEmail } = context;

  switch (type) {
    case NOTIFICATION_TYPES.TICKET_CREATED:
      return { to: VHD_EMAIL, cc: vendorEmail || null };

    case NOTIFICATION_TYPES.ASSIGNED:
    case NOTIFICATION_TYPES.VHD_TO_DEPT_L1:
      return { to: assignedEmail || null, cc: VHD_EMAIL };

    case NOTIFICATION_TYPES.DEPT_L1_TO_L2:
    case NOTIFICATION_TYPES.DEPT_L2_TO_L3:
    case NOTIFICATION_TYPES.DEPT_L3_TO_L4:
      // Multi-CC: VHD + previous level user
      return { to: assignedEmail || null, cc: [VHD_EMAIL, prevLevelEmail].filter(Boolean) };

    case NOTIFICATION_TYPES.DEPT_RESPONSE:
      return { to: VHD_EMAIL, cc: deptUserEmail || null };

    case NOTIFICATION_TYPES.CLARIFICATION_REQUIRED:
      return { to: vendorEmail || null, cc: VHD_EMAIL };

    case NOTIFICATION_TYPES.CLARIFICATION_RECEIVED:
      return { to: VHD_EMAIL, cc: vendorEmail || null };

    case NOTIFICATION_TYPES.RESOLVED:
      return { to: deptUserEmail || null, cc: VHD_EMAIL };

    case NOTIFICATION_TYPES.CLOSED:
      return { to: vendorEmail || null, cc: VHD_EMAIL };

    case NOTIFICATION_TYPES.REOPENED:
      return { to: VHD_EMAIL, cc: vendorEmail || null };

    default:
      return { to: null, cc: null };
  }
}

// ─── Email Templates ───

/**
 * Build the email subject line for a notification.
 * @param {string} type - Notification type
 * @param {Object} context - { ticketNo, subject }
 * @returns {string} Subject line
 */
function buildSubject(type, context) {
  const ticketNo = formatTicketNo(context.ticketNo) || `#${context.ticketId}`;

  const subjects = {
    [NOTIFICATION_TYPES.TICKET_CREATED]: `Ticket Created - ${ticketNo}`,
    [NOTIFICATION_TYPES.ASSIGNED]: `Ticket Assigned - ${ticketNo}`,
    [NOTIFICATION_TYPES.VHD_TO_DEPT_L1]: `Ticket Assigned to You - ${ticketNo}`,
    [NOTIFICATION_TYPES.DEPT_L1_TO_L2]: `Ticket Escalated to You - ${ticketNo}`,
    [NOTIFICATION_TYPES.DEPT_L2_TO_L3]: `Ticket Escalated to You - ${ticketNo}`,
    [NOTIFICATION_TYPES.DEPT_L3_TO_L4]: `Ticket Escalated to You - ${ticketNo}`,
    [NOTIFICATION_TYPES.DEPT_RESPONSE]: `New Response on Ticket - ${ticketNo}`,
    [NOTIFICATION_TYPES.CLARIFICATION_REQUIRED]: `Clarification Required - ${ticketNo}`,
    [NOTIFICATION_TYPES.CLARIFICATION_RECEIVED]: `Vendor Response Received - ${ticketNo}`,
    [NOTIFICATION_TYPES.RESOLVED]: `Ticket Resolved - ${ticketNo}`,
    [NOTIFICATION_TYPES.CLOSED]: `Ticket Closed - ${ticketNo}`,
    [NOTIFICATION_TYPES.REOPENED]: `Ticket Reopened - ${ticketNo}`,
  };

  return subjects[type] || `Ticket Notification - ${ticketNo}`;
}

/**
 * Build the HTML email body for a notification.
 * @param {string} type - Notification type
 * @param {Object} context - { ticketNo, subject, status, priority, remarks }
 * @returns {string} HTML body
 */
function buildBody(type, context) {
  const ticketNo = formatTicketNo(context.ticketNo) || `#${context.ticketId}`;
  const subject = context.subject || '';
  const status = context.status || '';
  const priority = context.priority || '';
  const remarks = context.remarks || '';

  const ticketInfo = [
    subject && `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>`,
    status && `<p><strong>Status:</strong> ${escapeHtml(status)}</p>`,
    priority && `<p><strong>Priority:</strong> ${escapeHtml(priority)}</p>`,
    remarks && `<p><strong>Remarks:</strong> ${escapeHtml(remarks)}</p>`,
  ].filter(Boolean).join('');

  const templates = {
    [NOTIFICATION_TYPES.TICKET_CREATED]: [
      `<p>Your ticket <strong>${ticketNo}</strong> has been created successfully.</p>`,
      ticketInfo,
    ].join(''),

    [NOTIFICATION_TYPES.ASSIGNED]: [
      `<p>Ticket <strong>${ticketNo}</strong> has been assigned to you.</p>`,
      ticketInfo,
    ].join(''),

    [NOTIFICATION_TYPES.VHD_TO_DEPT_L1]: [
      `<p>Ticket <strong>${ticketNo}</strong> has been assigned to you.</p>`,
      ticketInfo,
    ].join(''),

    [NOTIFICATION_TYPES.DEPT_L1_TO_L2]: [
      `<p>Ticket <strong>${ticketNo}</strong> has been escalated to you.</p>`,
      ticketInfo,
    ].join(''),

    [NOTIFICATION_TYPES.DEPT_L2_TO_L3]: [
      `<p>Ticket <strong>${ticketNo}</strong> has been escalated to you.</p>`,
      ticketInfo,
    ].join(''),

    [NOTIFICATION_TYPES.DEPT_L3_TO_L4]: [
      `<p>Ticket <strong>${ticketNo}</strong> has been escalated to you.</p>`,
      ticketInfo,
    ].join(''),

    [NOTIFICATION_TYPES.DEPT_RESPONSE]: [
      `<p>A new response has been posted on ticket <strong>${ticketNo}</strong>.</p>`,
      ticketInfo,
    ].join(''),

    [NOTIFICATION_TYPES.CLARIFICATION_REQUIRED]: [
      `<p>Clarification is required for ticket <strong>${ticketNo}</strong>.</p>`,
      `<p>Please review and respond to this ticket.</p>`,
      ticketInfo,
    ].join(''),

    [NOTIFICATION_TYPES.CLARIFICATION_RECEIVED]: [
      `<p>A vendor response has been received for ticket <strong>${ticketNo}</strong>.</p>`,
      ticketInfo,
    ].join(''),

    [NOTIFICATION_TYPES.RESOLVED]: [
      `<p>Ticket <strong>${ticketNo}</strong> has been resolved.</p>`,
      ticketInfo,
    ].join(''),

    [NOTIFICATION_TYPES.CLOSED]: [
      `<p>Ticket <strong>${ticketNo}</strong> has been closed.</p>`,
      ticketInfo,
    ].join(''),

    [NOTIFICATION_TYPES.REOPENED]: [
      `<p>Ticket <strong>${ticketNo}</strong> has been reopened.</p>`,
      ticketInfo,
    ].join(''),
  };

  return templates[type] || `<p>Ticket <strong>${ticketNo}</strong> has been updated.</p>`;
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
 * @param {string} [context.subject] - Ticket subject
 * @param {string} [context.status] - Current/target status text
 * @param {string} [context.priority] - Ticket priority
 * @param {string} [context.remarks] - Status change remarks
 * @param {string} [context.vendorEmail] - Vendor's email address
 * @param {string} [context.assignedEmail] - Assigned person's email
 * @param {string} [context.deptUserEmail] - Department user's email (current user)
 * @param {string} [context.prevLevelEmail] - Previous escalation level user's email
 * @returns {Promise<void>}
 */
export async function sendNotification(type, context = {}) {
  try {
    const { to, cc } = resolveRecipients(type, context);

    // Skip if no valid recipient
    if (!to) {
      console.warn(`[EmailNotification] Skipping ${type}: no recipient email available`);
      return;
    }

    const subject = buildSubject(type, context);
    const body = buildBody(type, context);

    // cc can be string, array, or null — mailService handles all cases
    const ccParam = Array.isArray(cc)
      ? (cc.length > 0 ? cc : undefined)
      : (cc || undefined);

    await mailService.sendMail({ emailId: to, subject, body, cc: ccParam });
  } catch (err) {
    // Email failure must never break the ticket workflow
    console.warn(`[EmailNotification] Failed to send ${type}:`, err);
  }
}
