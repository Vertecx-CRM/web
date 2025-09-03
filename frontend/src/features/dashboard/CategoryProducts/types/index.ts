export interface Category {
  id: number;
  nombre: string;
  descripcion: string;
  estado: "Activo" | "Inactivo";
}

export interface CreateCategoryData {
  nombre: string;
  descripcion: string;
  icono: File | null;
}