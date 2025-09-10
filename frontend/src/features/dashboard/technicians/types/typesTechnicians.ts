export type DocumentType =
  | "Cédula de ciudadanía"
  | "Cédula de extranjería"
  | "Tarjeta de identidad"
  | "Pasaporte"
  | "Otro";

export const DOCUMENT_TYPES: DocumentType[] = [
  "Cédula de ciudadanía",
  "Cédula de extranjería",
  "Tarjeta de identidad",
  "Pasaporte",
  "Otro",
];

export type TechnicianStatus = "Activo" | "Inactivo";

export interface Technician {
  id: number; // obligatorio
  name: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  email: string;
  image?: string;
  status?: TechnicianStatus;
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
  status?: TechnicianStatus;
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
  status?: TechnicianStatus;
}
