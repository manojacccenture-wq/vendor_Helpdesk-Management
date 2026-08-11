import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosClient } from './axiosClient.js';
import { appEndpoints } from './endpoints/appEndpoints.js';
import { ticketEndpoints } from './endpoints/ticketEndpoints.js';
import { commentEndpoints } from './endpoints/commentEndpoints.js';
import { feedbackEndpoints } from './endpoints/feedbackEndpoints.js';

// Custom base query that wraps our existing pre-configured axiosClient
const axiosBaseQuery =
  () =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await axiosClient({
        url,
        method,
        data,
        params,
        headers,
      });
      // The Axios interceptor already extracts response.data, so 'result' is the actual data payload.
      return { data: result };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Ticket'],
  endpoints: () => ({}),
});

// Inject domain-specific endpoints
apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    ...appEndpoints(builder),
    ...ticketEndpoints(builder),
    ...commentEndpoints(builder),
    ...feedbackEndpoints(builder),
  }),
});

// Re-export all generated hooks (preserves existing imports across the project)
export const {
  useGetDepartmentsQuery,
  useGetUsersByDepartmentQuery,
  useGetCategoriesQuery,
  useGetSubCategoriesQuery,
  useGetPrioritiesQuery,
  useGetTicketStatusesQuery,
  useCreateTicketMutation,
  useAddCommentMutation,
  useGetTicketCommentsQuery,
  useGetSubCategoryCtrlMappingQuery,
  useGetTicketCountQuery,
  useGetTicketListQuery,
  useGetTicketDetailsQuery,
  useAssignTicketMutation,
  useUpdateTicketStatusMutation,
  useSubmitFeedbackMutation,
} = apiSlice;
