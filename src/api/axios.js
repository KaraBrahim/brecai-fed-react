import axios from 'axios';

const api = axios.create({
    baseURL: 'https://breast-cancer-detection-backend-main-p7c9cg.laravel.cloud', // 👈 Point to root (so we can hit /sanctum/csrf-cookie)
    withCredentials: true, // 👈 CRITICAL: This allows cookies to travel
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Note: We DELETED the interceptor. The browser handles the cookie automatically now!

export default api;