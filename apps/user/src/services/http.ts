import axios from "axios";
import {
  clearStoredCustomerAuth,
  getCustomerAccessToken,
  setStoredCustomerAuth,
} from "@/features/auth/auth.storage";

type RetriableRequestConfig = {
  _retry?: boolean;
  headers?: Record<string, string>;
  url?: string;
};

const baseURL = import.meta.env.VITE_API_URL;

export const http = axios.create({
  baseURL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = getCustomerAccessToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config as RetriableRequestConfig | undefined;
    const status = err.response?.status;
    const url = String(originalRequest?.url || "");

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !url.includes("/auth/customer/login") &&
      !url.includes("/auth/customer/register") &&
      !url.includes("/auth/customer/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${baseURL}/auth/customer/refresh`,
          {},
          { withCredentials: true }
        );
        const payload = refreshResponse.data?.data;

        if (payload?.customer && payload?.accessToken) {
          setStoredCustomerAuth({ customer: payload.customer, accessToken: payload.accessToken });
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
          return http(originalRequest as never);
        }
      } catch {
        clearStoredCustomerAuth();
      }
    }

    return Promise.reject(err);
  }
);
