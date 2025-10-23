const API_URL = "http://localhost:3001/products-categories";

// 📦 Obtener todas las categorías
export const fetchCategories = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error al obtener las categorías");

  const data = await response.json();
  return data;
};


// 🧩 Crear una nueva categoría
export const createCategory = async (data: any) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Error al crear la categoría");
  return await response.json();
};

// ✏️ Actualizar categoría
export const updateCategory = async (id: number, data: any) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Error al actualizar la categoría");
  return await response.json();
};

// 🗑️ Eliminar categoría
export const deleteCategory = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Error al eliminar la categoría");
  return await response.json();
};
