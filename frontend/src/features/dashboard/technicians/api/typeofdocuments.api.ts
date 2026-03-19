import { api } from "@/shared/utils/apiClient";

export interface DocumentTypeResponse {
  typeofdocumentid: number;
  name: string;
  stateid: number;
}

export const getDocumentTypes = async (): Promise<DocumentTypeResponse[]> => {
  const { data } = await api.get<
    | DocumentTypeResponse[]
    | { success?: boolean; data?: DocumentTypeResponse[] }
  >("/typeofdocuments");

  return Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.data)
      ? (data as any).data
      : [];
};
