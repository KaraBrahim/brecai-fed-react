import axios from 'axios';

const BASE_URL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'https://breast-cancer-detection-backend-main-p7c9cg.laravel.cloud') + '/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default client;
