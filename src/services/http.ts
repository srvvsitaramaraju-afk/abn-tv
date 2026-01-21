import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_SHOWS_API_BASE as string,
  timeout: 10000,
});
console.log(import.meta.env.VITE_SHOWS_API_BASE,'baseurl')

// Normalize errors to a consistent Error(message) format
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    const message =
      error?.response?.data?.message ||
      error?.response?.data ||
      error?.message ||
      (status ? `HTTP ${status}` : 'Network error');

    return Promise.reject(new Error(message));
  }
);