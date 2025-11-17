import axios from "axios";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");

export const api = axios.create({
  baseURL: BASE,         
  headers: { "Content-Type": "application/json" },
});
