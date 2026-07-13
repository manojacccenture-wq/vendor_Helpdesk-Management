import axios from 'axios';
import { setupInterceptors } from './interceptors.js';

const baseURL = import.meta.env.VITE_API_BASE_URL ;

export const axiosClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': import.meta.env.VITE_API_KEY 
  },
});

setupInterceptors(axiosClient);
