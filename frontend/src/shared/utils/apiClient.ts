import axios, { type AxiosRequestConfig } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Axios instance for code that expects axios-style responses (response.data, error.response, etc.)
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type RequestOptions = AxiosRequestConfig;

// Thin wrapper that returns data directly (for fetch-like usage).
export const apiClient = {
  async get<T>(path: string, config?: RequestOptions): Promise<T> {
    const res = await api.get<T>(path, config);
    return res.data;
  },

  async post<T>(
    path: string,
    body?: unknown,
    config?: RequestOptions
  ): Promise<T> {
    const res = await api.post<T>(path, body, config);
    return res.data;
  },

  async patch<T>(
    path: string,
    body?: unknown,
    config?: RequestOptions
  ): Promise<T> {
    const res = await api.patch<T>(path, body, config);
    return res.data;
  },

  async delete<T>(path: string, config?: RequestOptions): Promise<T> {
    const res = await api.delete<T>(path, config);
    return res.data;
  },
};
