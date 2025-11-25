const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");
const API_URL = `${BASE_URL}/users`;
const DEFAULT_TIMEOUT = 12000;

const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit, timeoutMs = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
};

export const fetchUsers = async () => {
  try {
    const response = await fetchWithTimeout(API_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Error al obtener los usuarios");
    }
    const payload = await response.json();
    if (payload && typeof payload === "object" && "success" in payload) {
      return payload;
    }
    const data = payload?.data ?? payload;
    return { success: true, data };
  } catch (error) {
    console.error("Error en fetchUsers:", error);
    throw error;
  }
};

export const createUser = async (data: any) => {
  const response = await fetchWithTimeout(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Error al crear el usuario");
  }
  const payload = await response.json();
  return payload?.data ?? payload;
};

export const updateUser = async (id: number, data: any) => {
  const response = await fetchWithTimeout(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Error al actualizar el usuario");
  }
  const payload = await response.json();
  return payload?.data ?? payload;
};

export const deleteUser = async (id: number) => {
  const response = await fetchWithTimeout(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Error al eliminar el usuario");
  const payload = await response.json();
  return payload?.data ?? payload;
};

export const getUserById = async (id: number) => {
  const response = await fetchWithTimeout(`${API_URL}/${id}`);
  if (!response.ok) throw new Error("Error al obtener el usuario");
  const payload = await response.json();
  return payload?.data ?? payload;
};
