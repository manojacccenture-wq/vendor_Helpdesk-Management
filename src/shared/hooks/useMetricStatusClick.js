import { useMemo, useCallback } from 'react';
import { useGetTicketStatusesQuery } from '../api/apiSlice.js';

/**
 * Hook to manage dashboard metric card click interactions.
 * Translates human-readable metric labels ("Open", "In progress") into
 * backend status IDs and determines the active card state.
 *
 * @param {string|number} statusId - Current active status filter (empty string = all)
 * @param {Function} onStatusChange - Callback to update the status filter
 * @returns {Object} { onCardClick, isActive }
 */
export const useMetricStatusClick = (statusId, onStatusChange) => {
  const { data: statuses = [] } = useGetTicketStatusesQuery();

  // Build a map: lowercase label → status value (string)
  const labelToId = useMemo(() => {
    const map = {};
    for (const s of statuses) {
      const text = (s.text ?? s.Text ?? '').toLowerCase();
      const value = String(s.value ?? s.Value ?? '');
      if (text && value) {
        map[text] = value;
      }
    }
    return map;
  }, [statuses]);

  // Click handler: maps label to status ID and updates the filter
  const onCardClick = useCallback((label) => {
    if (!onStatusChange) return;
    
    // "Total tickets" clears the filter
    if (label === 'Total tickets') {
      onStatusChange('');
      return;
    }
    
    const id = labelToId[label.toLowerCase()];
    if (id) {
      // Toggle: clicking the same card again clears the filter
      onStatusChange(String(statusId) === id ? '' : id);
    }
  }, [onStatusChange, labelToId, statusId]);

  // Check which card is currently active
  const isActive = useCallback((label) => {
    if (statusId === '' || statusId == null) {
      return label === 'Total tickets';
    }
    
    if (label === 'Total tickets') return false;
    
    const id = labelToId[label.toLowerCase()];
    return id != null && String(statusId) === id;
  }, [statusId, labelToId]);

  return { onCardClick, isActive };
};
