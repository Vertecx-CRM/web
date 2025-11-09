// src/shared/utils/apiClient.ts
import axios from "axios";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");

export const api = axios.create({
  baseURL: BASE,              // ← sin /api y apuntando a 3001
  headers: { "Content-Type": "application/json" },
});
