import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosClient } from './axiosClient.js';

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
  endpoints: (builder) => ({
    getDepartments: builder.query({
      query: ({ role, userCode }) => ({ url: `/api/App/departments?role=${role}&userCode=${userCode}`, method: 'GET' }),
    }),
    getCategories: builder.query({
      query: () => ({ url: '/api/App/categories', method: 'GET' }),
    }),
    getSubCategories: builder.query({
      query: (categoryId) => ({
        url: `/api/App/subcategories${categoryId}`,
        method: 'GET',
      }),
      // Only run the query if categoryId exists
    }),
    getPriorities: builder.query({
      query: () => ({ url: '/api/App/priorities', method: 'GET' }),
    }),
    getTicketStatuses: builder.query({
      query: () => ({ url: '/api/App/ticketstatuses', method: 'GET' }),
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
    getSubCategoryCtrlMapping: builder.query({
      query: (subCategoryId) => ({
        url: `/api/Tickets/subcategoryctrlmapping?subCategoryId=${subCategoryId}`,
        method: 'GET',
      }),
    }),
    getTicketCount: builder.query({
      query: ({ role, userCode }) => ({ 
        url: `/api/Tickets/ticketcount?role=${role}&userCode=${userCode}`, 
        method: 'GET' 
      }),
      providesTags: ['Ticket'],
    }),
    getTicketList: builder.query({
      query: ({ userCode, role, statusId, categoryId }) => {
        const params = new URLSearchParams();
        if (userCode) params.append('userCode', userCode);
        if (role) params.append('role', role);
        if (statusId) params.append('statusId', statusId);
        if (categoryId) params.append('categoryId', categoryId);
        return {
          url: `/api/Tickets/ticketlist?${params.toString()}`,
          method: 'GET'
        };
      },
      providesTags: ['Ticket'],
    }),
    getTicketDetails: builder.query({
      query: ({ ticketId, role, userCode }) => ({
        url: `/api/Tickets/ticketdetails?ticketId=${ticketId}&role=${role}&userCode=${userCode}`,
        method: 'GET',
      }),
      providesTags: ['Ticket'],
    }),
    getUsersByDepartment: builder.query({
      query: (deptId) => ({
        url: `/api/user/users?role=BL1&deptId=${deptId}`,
        method: 'GET',
      }),
    }),
    assignTicket: builder.mutation({
      query: ({ ticketId, assignedDepartmentId, assignedAgentId }) => ({
        url: '/api/Tickets/assign',
        method: 'POST',
        data: { ticketId, assignedDepartmentId, assignedAgentId },
      }),
      invalidatesTags: ['Ticket'],
    }),
  }),
});

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
} = apiSlice;
