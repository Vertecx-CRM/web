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
}

export interface CreateTechnicianData {
  name: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  email: string;
  image?: string;
  state?: TechnicianState;
}

export interface EditTechnicianData {
  id: number;
  name: string;
  lastName: string;
  password?: string;
  confirmPassword?: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  email: string;
  image?: string;
  state?: TechnicianState;
}
