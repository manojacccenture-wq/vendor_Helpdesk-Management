/**
 * Feedback Endpoints
 *
 * Contains all feedback-related mutations.
 * These are pure endpoint definitions that receive the RTK Query `builder`.
 *
 * Endpoints:
 *   - submitFeedback: Submit feedback for a ticket
 */

export const feedbackEndpoints = (builder) => ({
  submitFeedback: builder.mutation({
    query: ({ ticketId, rating, ratingComment, isHelpful, tags }) => ({
      url: '/api/Tickets/feedback',
      method: 'POST',
      data: { ticketId, rating, ratingComment, isHelpful, tags },
    }),
    invalidatesTags: ['Ticket'],
  }),
});
