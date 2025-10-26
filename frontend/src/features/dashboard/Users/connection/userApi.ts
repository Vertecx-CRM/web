const API_URL = "http://localhost:3000/users";

export const fetchUsers = async () => {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Error al obtener los usuarios");
    }

    const data = await response.json(); // 👈 Aquí se leen los datos reales del backend
    console.log("✅ Datos recibidos desde la API (fetchUsers):", data); // 🔍 Log limpio de lo que llega

    return data;
  } catch (error) {
    console.error("❌ Error en fetchUsers:", error);
    throw error;
  }
};

export const createUser = async (data: any) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Error al crear el usuario");
  }
  return await response.json();
};

export const updateUser = async (id: number, data: any) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Error al actualizar el usuario");
  }
  return await response.json();
};

export const deleteUser = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Error al eliminar el usuario");
  return await response.json();
};

export const getUserById = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error("Error al obtener el usuario");
  return await response.json();
};
