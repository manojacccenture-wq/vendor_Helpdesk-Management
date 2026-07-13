import { axiosClient, API_ENDPOINTS } from '../../../shared/api/index.js';

export const userApi = {
  getProfile: async () => {
    const response = await axiosClient.get(API_ENDPOINTS.USER.GET_PROFILE);
    return response; // Note: response interceptor already returns response.data
  }
};
