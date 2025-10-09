export interface Service {
  id: number;
  name: string;
  description?: string;
  category: string;
  image: string | File | null; 
  state: "Activo" | "Inactivo";
}

export interface CreateServiceData {
  name: string;
  description?: string;
  category: string;
  image: string | File | null;
}

export interface EditServiceData extends CreateServiceData {
  id: number;
  state: "Activo" | "Inactivo";
}
