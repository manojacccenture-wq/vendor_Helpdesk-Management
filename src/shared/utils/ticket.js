/**
 * Ticket formatting utilities.
 *
 * Centralized ticket number display formatting.
 * All user-facing ticket numbers in the application should use
 * this utility to ensure consistent formatting.
 *
 * API returns (example): TKT-20260817055732
 * UI displays:            VHD-20260817055732
 *
 * The formatter safely handles:
 * - API returns "TKT-20260817055732" → strips TKT → adds VHD → "VHD-20260817055732"
 * - API returns "VHD-20260817055732" → strips VHD → adds VHD → "VHD-20260817055732"
 * - API returns "20260817055732"     → no prefix  → adds VHD → "VHD-20260817055732"
 * - Never produces "VHD-VHD-..." or "VHD-TKT-..."
 */

/** The centralized ticket number prefix displayed to users. */
export const TICKET_PREFIX = 'VHD';

/** Regex that matches any known prefix (TKT-, VHD-) case-insensitively. */
const EXISTING_PREFIX = /^(?:TKT|VHD)-/i;

/**
 * Format a raw ticket number with the centralized VHD prefix.
 *
 * Strips any existing prefix (TKT-, VHD-) and applies the VHD prefix.
 * This prevents double-prefixing regardless of what the API returns.
 *
 * @param {string|null|undefined} ticketNo - Raw ticket number from API
 * @returns {string|null|undefined} Formatted ticket number with VHD prefix
 */
export const formatTicketNo = (ticketNo) => {
  if (!ticketNo) return ticketNo;
  const stripped = ticketNo.replace(EXISTING_PREFIX, '');
  return `${TICKET_PREFIX}-${stripped}`;
};

/**
 * Add the VHD prefix to a raw (prefix-free) ticket number.
 * Use this when you already know the value has no prefix.
 * If the value might already have a prefix, use formatTicketNo() instead.
 *
 * @param {string|null|undefined} ticketNo - Raw ticket number (no prefix)
 * @returns {string|null|undefined} Ticket number with VHD prefix
 */
export const addTicketPrefix = (ticketNo) => {
  if (!ticketNo) return ticketNo;
  const stripped = ticketNo.replace(EXISTING_PREFIX, '');
  return `${TICKET_PREFIX}-${stripped}`;
};
