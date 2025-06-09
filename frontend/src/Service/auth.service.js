import api from "../lib/api.js";


export const login = (credentials) => api.post("/auth/login", credentials);

export const logout = () => api.post("/auth/logout");

export const Authcheck = () => api.get("/auth/checkAuth");

