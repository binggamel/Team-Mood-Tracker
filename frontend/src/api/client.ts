import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

type RetryableRequestConfig = {
  _retry?: boolean;
  url?: string;
  headers?: Record<string, string>;
};

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = (error.config ?? {}) as RetryableRequestConfig;
    const status = error?.response?.status;
    const refreshToken = localStorage.getItem("refreshToken");

    if (
      status === 401 &&
      refreshToken &&
      originalRequest &&
      !originalRequest._retry &&
      !String(originalRequest.url ?? "").includes("/auth/refresh/")
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post("/auth/refresh/", { refresh: refreshToken });
        localStorage.setItem("accessToken", data.access);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
