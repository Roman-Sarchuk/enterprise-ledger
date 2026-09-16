import axios from "axios";
import { env } from "@/app/config/env";
import { getAccessToken, useAuthStore } from "@/store/authStore";

function buildApiBaseUrl(): string {
  const base = env.apiUrl.endsWith("/") ? env.apiUrl : `${env.apiUrl}/`;
  return new URL("api/v1", base).toString();
}

export const api = axios.create({
  baseURL: buildApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status as number | undefined;
    if (status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

