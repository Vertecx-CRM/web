export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  state: "Activo" | "Inactivo";
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
}

export interface EditServiceData extends CreateServiceData {
  id: number;
  state: "Activo" | "Inactivo";
}
