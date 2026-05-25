import axios from "axios";

const ACCESS_TOKEN_KEY = "admin_access_token";
const baseURL = import.meta.env.VITE_API_URL;

type RetriableRequestConfig = {
  _retry?: boolean;
  headers?: Record<string, string>;
  url?: string;
};

export function getAdminAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAdminAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAdminAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export const http = axios.create({
  baseURL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = getAdminAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const status = error.response?.status;
    const url = String(originalRequest?.url || "");

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !url.includes("/auth/admin/login") &&
      !url.includes("/auth/admin/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${baseURL}/auth/admin/refresh`,
          {},
          { withCredentials: true }
        );
        const payload = refreshResponse.data?.data;

        if (payload?.accessToken) {
          setAdminAccessToken(payload.accessToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
          return http(originalRequest as never);
        }
      } catch {
        clearAdminAccessToken();
      }
    }

    return Promise.reject(error);
  }
);
