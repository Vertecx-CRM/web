const API_URL = "http://localhost:3001/roles/list";

export const fetchRoles = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error al obtener los roles");
  const result = await response.json();

  return Array.isArray(result) ? result : result.data || [];
};
