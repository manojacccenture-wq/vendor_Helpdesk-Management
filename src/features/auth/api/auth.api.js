import { axiosClient, API_ENDPOINTS } from '../../../shared/api/index.js';
import { dbstsClient } from '../../../shared/api/dbstsClient.js';

/**
 * Example Feature API: Auth
 * This module purely manages requests relevant to the auth feature.
 */
export const AuthApi = {
  login: async (credentials) => {
    return axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  // logout: async () => {
  //   // Use DBSTS client for logout (different server)
  //   return dbstsClient.get(API_ENDPOINTS.AUTH.LOGOUT);
  // },

  logout: async () => {
    window.location.href = 'https://servicedesk.tsusl.co.in/DBSTS/Account/Logout';
  },

  getProfile: async () => {
    return axiosClient.get('/auth/profile');
  }
};
