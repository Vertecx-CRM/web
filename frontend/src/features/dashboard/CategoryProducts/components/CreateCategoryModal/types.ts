export interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: any) => void;
}

export interface CategoryFormData {
  nombre: string;
  descripcion: string;
  icono: File | null;
}

export interface FormErrors {
  nombre: string;
  descripcion: string;
}

export interface FormTouched {
  nombre: boolean;
  descripcion: boolean;
}