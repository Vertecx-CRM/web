import { useEffect, useState } from "react";
import { fetchDocumentTypes } from "../connection/documentTypeApi";

export interface DocumentType {
  typeofdocumentid: number;
  name: string;
  createat?: string;
  updateat?: string | null;
}

export const useDocumentTypes = () => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDocTypes = async () => {
      setLoading(true);
      try {
        const data = await fetchDocumentTypes();
        setDocumentTypes(data);
      } catch (error) {
        console.error("Error al cargar tipos de documento:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDocTypes();
  }, []);

  return { documentTypes, loading };
};
