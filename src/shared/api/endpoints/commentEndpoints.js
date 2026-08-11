/**
 * Comment Endpoints
 *
 * Contains all comment-related queries and mutations.
 * These are pure endpoint definitions that receive the RTK Query `builder`.
 *
 * Endpoints:
 *   - getTicketComments: Fetch comments for a ticket
 *   - addComment: Add a new comment to a ticket
 */

export const commentEndpoints = (builder) => ({
  getTicketComments: builder.query({
    query: ({ ticketId, role, userCode }) => {
      const params = new URLSearchParams();
      if (userCode) params.append('userCode', userCode);
      if (role) params.append('role', role);
      if (ticketId) params.append('ticketId', ticketId);
      return {
        url: `/api/Tickets/viewcomments?${params.toString()}`,
        method: 'GET',
      };
    },
    providesTags: ['Ticket'],
  }),

  addComment: builder.mutation({
    query: ({ ticketId, parentCommentId, body, isInternal, isEdited, userCode, role }) => ({
      url: '/api/Tickets/addcomment',
      method: 'POST',
      data: {
        ticketId,
        parentCommentId: parentCommentId || 0,
        body,
        isInternal: isInternal ?? false,
        isEdited: isEdited ?? false,
        userCode,
        role,
      },
    }),
    invalidatesTags: ['Ticket'],
  }),
});
