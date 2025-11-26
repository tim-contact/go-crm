import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE,
});

// attach the auth token to each request if it exists

api.interceptors.request.use((config) => {
    const t = localStorage.getItem("token");
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;

});

api.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err.response?.status == 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
)