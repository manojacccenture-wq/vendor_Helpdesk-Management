import axios from 'axios';
import { TokenService } from './auth.js';
import { handleApiError } from './errorHandler.js';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = (axiosInstance) => {
  // Request Interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = TokenService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      // Directly return the data payload to the feature API layer
      return response.data;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized for Refresh Token Flow
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If a refresh is already happening, pause this request and queue it
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = TokenService.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Fetch new token using a fresh instance to avoid interceptor infinite loops
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || ''}/auth/refresh-token`,
            { refreshToken }
          );

          const newToken = data.accessToken;
          TokenService.setToken(newToken);
          
          if (data.refreshToken) {
            TokenService.setRefreshToken(data.refreshToken);
          }

          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Re-fire the original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          TokenService.clearAll();
          
          // Dispatch a global event to redirect to login
          window.dispatchEvent(new Event('auth:logout'));
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Delegate all other errors to the centralized handler
      return handleApiError(error);
    }
  );
};
