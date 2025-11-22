const API_URL = "http://localhost:3001/typeofdocuments";

export interface DocumentTypeResponse {
  typeofdocumentid: number;
  name: string;
  stateid: number;
}

export const getDocumentTypes = async (): Promise<DocumentTypeResponse[]> => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error al obtener los tipos de documento");
  }

  const result = await response.json();

  // El backend trae todo dentro de "data"
  return result.data || [];
};
