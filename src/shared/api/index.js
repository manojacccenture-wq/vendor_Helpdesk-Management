// Base API slice and configuration
export { apiSlice } from './apiSlice.js';

// All generated RTK Query hooks
export {
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
} from './apiSlice.js';

// Shared utilities
export { axiosClient } from './axiosClient.js';
export { TokenService } from './auth.js';
export { API_ENDPOINTS } from './endpoints.js';
