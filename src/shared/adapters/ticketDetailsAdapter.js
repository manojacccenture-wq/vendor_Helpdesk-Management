/**
 * Ticket Details Adapter
 *
 * Transforms the raw API ticket details response into a stable frontend view model.
 * Isolates API response structure changes from all UI components.
 *
 * Architecture:
 *   API Response
 *     ↓ adaptTicketDetails()
 *     ↓ Stable Ticket Details View Model
 *     ↓ UI components (TicketDetailsView, TicketHistoryPage, TicketCommentsPage, etc.)
 *
 * Current transformation:
 *   - ticketHistoryStages: preserves stage-based hierarchy (Helpdesk → Department → Vendor)
 *   - Each stage contains its own histories array (NOT flattened)
 *   - All fields (title, remarks, description, changedBy, changedAt, metadata) preserved
 *
 * UI components consume only the adapted model — never the raw API response.
 */

/**
 * Coerce a permission/visibility flag while preserving "not provided".
 *
 * Returns the boolean value when the API sends one (boolean or "true"/"false"),
 * and `undefined` when the property is absent — so callers can distinguish
 * "explicitly disabled" from "backend did not send it" and apply their fallback.
 * Never invents a `true`.
 *
 * @param {...*} values - Candidate values (camelCase first, PascalCase second)
 * @returns {boolean|undefined} Resolved flag or undefined when absent
 */
const optionalBool = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null || value === '') continue;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
    return Boolean(value);
  }
  return undefined;
};

/**
 * Adapt the raw ticket details API response into the frontend view model.
 *
 * Preserves the stage-based hierarchy:
 *   ticketHistoryStages: [{ stage: "Helpdesk", histories: [...] }, ...]
 *
 * All other top-level fields (ticketId, ticketNo, sections, attachments, etc.)
 * are passed through unchanged.
 *
 * @param {Object|null} raw - Raw API response from GET /api/Tickets/ticketdetails
 * @returns {Object|null} Adapted ticket details view model
 */
export function adaptTicketDetails(raw) {
  if (!raw) return null;

  return {
    ...raw,
    isForwarded: Boolean(raw.isForwarded ?? raw.IsForwarded ?? false),
    isResolved: Boolean(raw.isResolved ?? raw.IsResolved ?? false),
    isOnHold: Boolean(raw.isOnHold ?? raw.IsOnHold ?? false),
    // Backend action permissions — the source of truth for ticket action visibility.
    // Kept as undefined when absent so UI fallbacks stay in control.
    canUpdateStatus: optionalBool(raw.canUpdateStatus, raw.CanUpdateStatus),
    canForward: optionalBool(raw.canForward, raw.CanForward),
    canCancel: optionalBool(raw.canCancel, raw.CanCancel),
    visibleAssignButton: optionalBool(raw.visibleAssignButton, raw.VisibleAssignButton),
    visibleCommentButton: optionalBool(raw.visibleCommentButton, raw.VisibleCommentButton),
    visibleFeedbackButton: optionalBool(raw.visibleFeedbackButton, raw.VisibleFeedbackButton),
    ticketHistoryStages: adaptTicketHistoryStages(raw.ticketHistoryStages),
  };
}

/**
 * Normalize ticketHistoryStages while preserving the stage-based hierarchy.
 *
 * Each stage group (Helpdesk, Department, Vendor) contains a histories array.
 * This function preserves that hierarchy — it does NOT flatten.
 *
 * The `title` field is passed through unchanged — the API titles already match
 * the EVENT_CONFIG keys in TicketHistoryList (case-insensitive).
 *
 * Sorting within each stage and stage-level rendering are handled by the UI.
 *
 * @param {Array|null} stages - ticketHistoryStages from API response
 * @returns {Array} Array of stage objects, each with a histories array
 */
function adaptTicketHistoryStages(stages) {
  if (!Array.isArray(stages)) return [];

  return stages.map(stage => ({
    stage: stage.stage || null,
    histories: Array.isArray(stage.histories)
      ? stage.histories.map(h => ({
          title: h.title || '',
          remarks: h.remarks || null,
          description: h.description || '',
          changedBy: h.changedBy || '',
          changedAt: h.changedAt || '',
          metadata: h.metadata || null,
        }))
      : [],
  }));
}

export default adaptTicketDetails;
