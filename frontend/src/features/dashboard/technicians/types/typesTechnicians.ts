export type DocumentType =
  | "CC"
  | "CE"
  | "TI"
  | "Pasaporte"
  | "PPT"
  | "PEP"
  | "Otro";

export const DOCUMENT_TYPES: DocumentType[] = [
  "CC",
  "CE",
  "TI",
  "Pasaporte",
  "PPT",
  "PEP",
  "Otro",
];

export type TechnicianState = "Activo" | "Inactivo";

export interface Technician {
  id: number;
  name: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  email: string;
  image?: string;
  state?: TechnicianState;
  types: string[];       // ["Cableado estructurado", "Electricista", "Redes"]
  resumeUrl?: string;    // URL al PDF (cuando exista)
}

export interface CreateTechnicianData {
  name: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  email: string;
  image?: string;
  state?: TechnicianState;
  types: string[];
  resumePdf: File;
}

export interface EditTechnicianData {
  id: number;
  name: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  email: string;
  image?: string;
  state?: TechnicianState;
  types: string[];
  resumePdf?: File;
}

export type TechnicianErrors = {
  name?: string;
  lastName?: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  image?: string;
  state?: string;
  types?: string;
  resumePdf?: string;
};
