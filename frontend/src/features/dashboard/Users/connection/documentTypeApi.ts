const API_URL = "http://localhost:3000/typeofdocuments";

export const fetchDocumentTypes = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error al obtener los tipos de documento");
  const result = await response.json();
  return result.data || [];
};
