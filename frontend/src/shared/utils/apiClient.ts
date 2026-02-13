// ─────────────────────────────────────────────────────
// Cliente HTTP genérico para conectar con el backend
// ─────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type RequestOptions = {
    headers?: Record<string, string>;
};

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
            errorBody?.message ||
            (Array.isArray(errorBody?.message)
                ? errorBody.message.join(", ")
                : `Error ${response.status}: ${response.statusText}`);
        throw new Error(typeof message === "string" ? message : JSON.stringify(message));
    }
    return response.json() as Promise<T>;
}

export const apiClient = {
    async get<T>(path: string, options?: RequestOptions): Promise<T> {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            credentials: "include",
        });
        return handleResponse<T>(res);
    },

    async post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            credentials: "include",
            body: JSON.stringify(body),
        });
        return handleResponse<T>(res);
    },

    async patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            credentials: "include",
            body: JSON.stringify(body),
        });
        return handleResponse<T>(res);
    },

    async delete<T>(path: string, options?: RequestOptions): Promise<T> {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            credentials: "include",
        });
        return handleResponse<T>(res);
    },
};