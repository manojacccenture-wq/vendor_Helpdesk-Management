/**
 * App/Reference Data Endpoints
 *
 * Contains all reference/lookup data queries used across the application.
 * These are pure endpoint definitions that receive the RTK Query `builder`.
 *
 * Endpoints:
 *   - getDepartments: Fetch departments for a given role/user
 *   - getCategories: Fetch all ticket categories
 *   - getSubCategories: Fetch sub-categories by category ID
 *   - getPriorities: Fetch all priority levels
 *   - getTicketStatuses: Fetch all ticket statuses
 *   - getUsersByDepartment: Fetch users by department ID
 */

export const appEndpoints = (builder) => ({
  getDepartments: builder.query({
    query: ({ role, userCode }) => ({
      url: `/api/App/departments?role=${role}&userCode=${userCode}`,
      method: 'GET',
    }),
  }),

  getCategories: builder.query({
    query: () => ({
      url: '/api/App/categories',
      method: 'GET',
    }),
  }),

  getSubCategories: builder.query({
    query: (categoryId) => ({
      url: `/api/App/subcategories${categoryId}`,
      method: 'GET',
    }),
    // Only run the query if categoryId exists
  }),

  getPriorities: builder.query({
    query: () => ({
      url: '/api/App/priorities',
      method: 'GET',
    }),
  }),

  getTicketStatuses: builder.query({
    query: () => ({
      url: '/api/App/ticketstatuses',
      method: 'GET',
    }),
  }),

  getUsersByDepartment: builder.query({
    query: (deptId) => ({
      url: `/api/user/users?role=BL1&deptId=${deptId}`,
      method: 'GET',
    }),
  }),
});
