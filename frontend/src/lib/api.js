import axios from "axios";


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});


// Response interceptor to handle global errors

api.interceptors.response.use(
    response => response.data,
    error => {
        const errorMessage = error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred";
        return Promise.reject(new Error(errorMessage));
    });


export default api;