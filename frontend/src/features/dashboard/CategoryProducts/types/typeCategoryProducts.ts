export interface Category {
  id: number;
  nombre: string;
  descripcion: string;
  estado: "Activo" | "Inactivo";
  icono?: File | null;
}

// Tipo base para reusar en create y edit
export interface CategoryBase {
  nombre: string;
  descripcion: string;
  icono?: File | null;
}

// Crear: solo usa los campos base
export interface CreateCategoryData extends CategoryBase {}

// Editar: base + extras
export interface EditCategoryData extends CategoryBase {
  id: number;
  estado: "Activo" | "Inactivo";
}

export interface FormErrors {
  nombre: string;
  descripcion: string;
}

export interface FormTouched {
  nombre: boolean;
  descripcion: boolean;
}

export interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: CategoryBase) => void;
}

export interface EditCategoryModalProps {
  isOpen: boolean;
  category: EditCategoryData | null; 
  onClose: () => void;
  onSave: (categoryData: EditCategoryData ) => void;
}

export interface ViewCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
}


