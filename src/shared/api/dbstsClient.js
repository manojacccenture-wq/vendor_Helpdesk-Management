import axios from 'axios';

/**
 * DBSTS Axios Client
 * 
 * Separate axios instance for DBSTS authentication endpoints.
 * Used for logout and other auth operations that are on a different server.
 */
const dbstsClient = axios.create({
  baseURL: import.meta.env.VITE_DBSTS_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': import.meta.env.VITE_API_KEY
  },
});

export { dbstsClient };
