/**
 * Ticket formatting utilities.
 *
 * Strips the "TKT-" prefix from API ticket numbers for display.
 * API returns: TKT-20260817055732
 * UI displays: 20260817055732
 *
 * Safe handling:
 * - If value is null/undefined/empty, returns it unchanged
 * - If value does not contain "TKT-" prefix, returns it unchanged
 * - Does not alter the numeric portion
 */

const TKT_PREFIX = /^TKT-/i;

/**
 * Strip the "TKT-" prefix from a ticket number for display.
 * @param {string|null|undefined} ticketNo
 * @returns {string|null|undefined}
 */
export const formatTicketNo = (ticketNo) => {
  if (!ticketNo) return ticketNo;
  return ticketNo.replace(TKT_PREFIX, '');
};
