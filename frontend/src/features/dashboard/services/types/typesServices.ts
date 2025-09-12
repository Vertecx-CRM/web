export interface Service {
  id: number;
  name: string;
  description?: string;
  category: string;
  image: string | File; 
  state: "Activo" | "Inactivo";
}

export interface CreateServiceData {
  name: string;
  description?: string;
  category: string;
  image: string | File;
}

export interface EditServiceData extends CreateServiceData {
  id: number;
  state: "Activo" | "Inactivo";
}
