/**
 * Ticket Endpoints
 *
 * Contains all ticket-related queries and mutations.
 * These are pure endpoint definitions that receive the RTK Query `builder`.
 *
 * Endpoints:
 *   - getTicketList: Fetch filtered ticket list
 *   - getTicketDetails: Fetch single ticket details
 *   - getTicketCount: Fetch ticket count for dashboard metrics
 *   - createTicket: Create a new ticket (multipart/form-data)
 *   - assignTicket: Assign ticket to department/agent
 *   - updateTicketStatus: Update ticket status
 *   - getSubCategoryCtrlMapping: Fetch dynamic form controls for sub-category
 */

import { adaptTicketDetails } from '../../adapters/ticketDetailsAdapter.js';

export const ticketEndpoints = (builder) => ({
  getTicketList: builder.query({
    query: ({ userCode, role, statusId, categoryId, priorityId }) => {
      const params = new URLSearchParams();
      if (userCode) params.append('userCode', userCode);
      if (role) params.append('role', role);
      if (statusId != null && statusId !== '') params.append('statusId', statusId);
      if (categoryId) params.append('categoryId', categoryId);
      if (priorityId) params.append('priorityId', priorityId);
      return {
        url: `/api/Tickets/ticketlist?${params.toString()}`,
        method: 'GET',
      };
    },
    providesTags: ['Ticket'],
  }),

  getTicketDetails: builder.query({
    query: ({ ticketId, role, userCode }) => ({
      url: `/api/Tickets/ticketdetails?ticketId=${ticketId}&role=${role}&userCode=${userCode}`,
      method: 'GET',
    }),
    transformResponse: adaptTicketDetails,
    providesTags: ['Ticket'],
  }),

  getTicketCount: builder.query({
    query: ({ role, userCode }) => ({
      url: `/api/Tickets/ticketcount?role=${role}&userCode=${userCode}`,
      method: 'GET',
    }),
    providesTags: ['Ticket'],
  }),

  createTicket: builder.mutation({
    query: (formData) => ({
      url: '/api/Tickets/create',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    invalidatesTags: ['Ticket'],
  }),

  assignTicket: builder.mutation({
    query: ({ ticketId, assignedDepartmentId, assignedDeptBL1UserCode }) => ({
      url: '/api/Tickets/assign',
      method: 'POST',
      data: { ticketId, assignedDepartmentId, assignedDeptBL1UserCode },
    }),
    invalidatesTags: ['Ticket'],
  }),

  updateTicketStatus: builder.mutation({
    query: ({ ticketId, status, remarks }) => ({
      url: `/api/Tickets/updatestatus?ticketId=${ticketId}`,
      method: 'POST',
      data: { status, remarks },
      headers: {
        'Accept': 'text/plain',
      },
    }),
    invalidatesTags: ['Ticket'],
  }),

  getSubCategoryCtrlMapping: builder.query({
    query: (subCategoryId) => ({
      url: `/api/Tickets/subcategoryctrlmapping?subCategoryId=${subCategoryId}`,
      method: 'GET',
    }),
  }),
});
