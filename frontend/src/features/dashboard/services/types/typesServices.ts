export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  status: "Activo" | "Inactivo";
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
  status: "Activo" | "Inactivo";
}
