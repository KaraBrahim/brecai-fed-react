import axios from 'axios';

const api = axios.create({
    baseURL: '/', // 👈 Point to root (so we can hit /sanctum/csrf-cookie)
    withCredentials: true, // 👈 CRITICAL: This allows cookies to travel
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default api;