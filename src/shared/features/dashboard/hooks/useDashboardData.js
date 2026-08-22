import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetTicketListQuery, useGetTicketCountQuery } from '../../../api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../../../features/user/store/selectors.js';
import { usePagination } from '../../../hooks/usePagination.js';

/**
 * useDashboardData — Unified data-fetching hook for all role dashboards.
 *
 * Centralizes:
 * - Ticket list fetching via useGetTicketListQuery
 * - Per-status count derivation (identical across all roles)
 * - Client-side search filtering (identical across all roles)
 * - Pagination via usePagination
 *
 * @param {Object} queryParams - Parameters for the ticket list API query.
 *   Built by each role config's getTicketQueryParams().
 *   { userCode, role, statusId, categoryId, priorityId }
 * @param {string} searchTerm - Client-side search string (filters subject + ticketNo)
 * @returns {Object} Unified data object for the Dashboard
 */
export const useDashboardData = (queryParams, searchTerm) => {
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);

  // ─── Fetch UNFILTERED ticket list (for dashboard card counts) ───
  // Always fetches all tickets regardless of status filter.
  // This ensures dashboard card counts remain stable when a card is clicked.
  const { data: allTickets = [], isLoading: isLoadingAll, isError: isErrorAll } = useGetTicketListQuery(
    {
      userCode: profile?.userCode,
      role,
      // Intentionally omit statusId, categoryId, priorityId to get all tickets
    },
    { skip: !profile?.userCode || !role }
  );

  // ─── Fetch FILTERED ticket list (for the table display) ───
  // Applies the current status/category/priority filter from card clicks or toolbar.
  const { data: filteredTicketsRaw = [], isLoading: isLoadingFiltered, isError: isErrorFiltered } = useGetTicketListQuery(
    {
      userCode: profile?.userCode,
      role,
      ...queryParams,
    },
    { skip: !profile?.userCode || !role }
  );

  // ─── Fetch ticket count (for roles that need total/SLA data) ───
  const { data: countData, isLoading: isLoadingCount, isError: isErrorCount } = useGetTicketCountQuery(
    { role, userCode: profile?.userCode },
    { skip: !profile?.userCode || !role }
  );

  // ─── Derive per-status counts from UNFILTERED ticket list ───
  // This ensures dashboard cards always show total counts, not filtered counts.
  const counts = useMemo(() => {
    const result = {
      total: allTickets.length,
      open: 0,
      inProgress: 0,
      onHold: 0,
      resolved: 0,
      closed: 0,
      escalated: 0,
    };
    for (const ticket of allTickets) {
      const s = (ticket.status || '').toLowerCase();
      if (s === 'open') result.open++;
      else if (s === 'in progress') result.inProgress++;
      else if (s === 'on hold') result.onHold++;
      else if (s === 'resolved') result.resolved++;
      else if (s === 'closed') result.closed++;
      else if (s === 'escalated') result.escalated++;
    }
    return result;
  }, [allTickets]);

  // ─── Client-side search filtering on the FILTERED ticket list ───
  const filteredTickets = useMemo(() => {
    if (!searchTerm) return filteredTicketsRaw;
    const lowerSearch = searchTerm.toLowerCase();
    return filteredTicketsRaw.filter(ticket =>
      ticket.subject?.toLowerCase().includes(lowerSearch) ||
      ticket.ticketNo?.toLowerCase().includes(lowerSearch)
    );
  }, [filteredTicketsRaw, searchTerm]);

  // ─── Pagination ───
  const {
    paginatedData, currentPage, totalPages, totalItems,
    itemsPerPage, nextPage, prevPage, setItemsPerPage,
  } = usePagination(filteredTickets, 10);

  return {
    tickets: filteredTicketsRaw,
    allTickets,
    counts,
    countData,
    filteredTickets,
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    isLoading: isLoadingAll || isLoadingFiltered || isLoadingCount,
    isError: isErrorAll || isErrorFiltered || isErrorCount,
    profile,
    role,
  };
};
