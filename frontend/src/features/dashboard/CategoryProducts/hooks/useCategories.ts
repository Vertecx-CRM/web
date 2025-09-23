import { useState, useEffect } from "react";
import {  Category, CreateCategoryData, EditCategoryData, FormErrors, FormTouched, EditCategoryModalProps, CreateCategoryModalProps } from "../types/typeCategoryProducts";
import { initialCategories } from "../mocks/mockCategoryProducts";
import { showSuccess } from "@/shared/utils/notifications";
import { 
  hasNumbers, 
  hasSpecialChars, 

  validateFormWithNotification,
  validateNombreWithNotification,
  validateDescripcionWithNotification
} from "../validations/categoryValidations";
import { confirmDelete } from "@/shared/utils/Delete/confirmDelete";

// Clave para el localStorage
const CATEGORIES_STORAGE_KEY = 'categories';

// Función para convertir File a Base64 (COLOCAR AL INICIO DEL ARCHIVO)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Función para cargar categorías con manejo de iconos Base64 (COLOCAR DESPUÉS DE fileToBase64)
const loadCategoriesFromStorage = (): Category[] => {
  if (typeof window === 'undefined') return initialCategories;
  
  try {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(initialCategories));
    return initialCategories;
  } catch (error) {
    console.error('Error loading categories from localStorage:', error);
    return initialCategories;
  }
};

// Función para guardar categorías en el localStorage (COLOCAR DESPUÉS DE loadCategoriesFromStorage)
const saveCategoriesToStorage = (categories: Category[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories to localStorage:', error);
  }
};

export const useCategories = () => {
  // Cargar categorías desde localStorage al inicializar
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EditCategoryData | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  // Cargar categorías del localStorage cuando el componente se monta
  useEffect(() => {
    const loadedCategories = loadCategoriesFromStorage();
    setCategories(loadedCategories);
  }, []);

  // Función para actualizar el estado y el localStorage simultáneamente (DENTRO DEL HOOK)
  const updateCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    saveCategoriesToStorage(newCategories);
  };

  // En handleCreateCategory, convertir icono a Base64 si existe (REEMPLAZAR LA FUNCIÓN EXISTENTE)
  const handleCreateCategory = async (categoryData: CreateCategoryData) => {
    let iconoBase64 = null;
    
    if (categoryData.icono instanceof File) {
      try {
        iconoBase64 = await fileToBase64(categoryData.icono);
      } catch (error) {
        console.error('Error converting icon to Base64:', error);
      }
    }

    const newCategory: Category = {
      id: Math.max(0, ...categories.map(c => c.id)) + 1,
      nombre: categoryData.nombre,
      descripcion: categoryData.descripcion,
      estado: "Activo",
      icono: iconoBase64 || categoryData.icono
    };

    const updatedCategories = [...categories, newCategory];
    updateCategories(updatedCategories);
    setIsCreateModalOpen(false);

    showSuccess('Categoría de producto creada exitosamente!');
  };

  // También necesitas actualizar handleEditCategory para manejar Base64
  const handleEditCategory = async (id: number, categoryData: EditCategoryData) => {
    let iconoBase64 = null;
    
    if (categoryData.icono instanceof File) {
      try {
        iconoBase64 = await fileToBase64(categoryData.icono);
      } catch (error) {
        console.error('Error converting icon to Base64:', error);
      }
    }

    const updatedCategories = categories.map(category =>
      category.id === id
        ? { 
            ...category, 
            ...categoryData,
            icono: iconoBase64 || categoryData.icono || category.icono
          }
        : category
    );
    
    updateCategories(updatedCategories);
    setEditingCategory(null);

    showSuccess('Categoría de producto actualizada exitosamente!');
  };

  const handleDeleteCategory = async (category: Category): Promise<boolean> => {
    return confirmDelete(
      {
        itemName: category.nombre,
        itemType: 'categoría',
        successMessage: `La categoría "${category.nombre}" ha sido eliminada correctamente.`,
        errorMessage: 'No se pudo eliminar la categoría. Por favor, intenta nuevamente.',
      },
      () => {
        const updatedCategories = categories.filter(c => c.id !== category.id);
        updateCategories(updatedCategories);
      }
    );
  };

  const handleView = (category: Category) => {
    setViewingCategory(category);
  };

  const handleEdit = (category: EditCategoryData) => {
    setEditingCategory(category);
  };

  const handleDelete = async (category: Category) => {
    await handleDeleteCategory(category);
  };

  const closeModals = () => {
    setEditingCategory(null);
    setViewingCategory(null);
    setIsCreateModalOpen(false);
  };

  // Función para resetear las categorías a las iniciales (útil para testing)
  const resetCategories = () => {
    updateCategories(initialCategories);
  };

  return {
    categories,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingCategory,
    viewingCategory,
    handleCreateCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleView,
    handleEdit,
    handleDelete,
    closeModals,
    setEditingCategory,
    setViewingCategory,
    resetCategories // Opcional: para debugging
  };
};

// Hook para el formulario de creación
export const useCreateCategoryForm = ({
  isOpen,
  onClose,
  onSave,
}: CreateCategoryModalProps) => {
  const [formData, setFormData] = useState<CreateCategoryData>({
    nombre: '',
    descripcion: '',
    icono: null,
  });

  const [errors, setErrors] = useState<FormErrors>({
    nombre: '',
    descripcion: ''
  });

  const [touched, setTouched] = useState<FormTouched>({
    nombre: false,
    descripcion: false
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: '',
        descripcion: '',
        icono: null
      });
      setErrors({
        nombre: '',
        descripcion: ''
      });
      setTouched({
        nombre: false,
        descripcion: false
      });
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'nombre' || name === 'descripcion') {
      // Usar las funciones de validación importadas
      if (hasSpecialChars(value)) return;
      if (name === 'nombre' && hasNumbers(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validación en tiempo real con notificaciones
    if (name === 'nombre') {
      validateNombreWithNotification({ nombre: value, descripcion: formData.descripcion }, setErrors, setTouched);
    } else if (name === 'descripcion') {
      validateDescripcionWithNotification({ nombre: formData.nombre, descripcion: value }, setErrors, setTouched);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, icono: file }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Validación al perder el foco
    if (name === 'nombre') {
      validateNombreWithNotification(formData, setErrors, setTouched);
    } else if (name === 'descripcion') {
      validateDescripcionWithNotification(formData, setErrors, setTouched);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Usar la nueva función de validación con notificaciones
    const isValid = validateFormWithNotification(formData, setErrors, setTouched);

    if (isValid) {
      onSave(formData);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return {
    formData,
    errors,
    touched,
    handleInputChange,
    handleIconChange,
    handleBlur,
    handleSubmit
  };
};

// Hook para el formulario de Editar 
export const useEditCategoryForm = ({
  isOpen,
  category,
  onClose,
  onSave,
}: EditCategoryModalProps) => {
  const [formData, setFormData] = useState<EditCategoryData>({
    id: 0,
    nombre: '',
    descripcion: '',
    estado: 'Activo',
    icono: null,
  });

  const [errors, setErrors] = useState<FormErrors>({
    nombre: '',
    descripcion: ''
  });

  const [touched, setTouched] = useState<FormTouched>({
    nombre: false,
    descripcion: false
  });

  const [currentIcon, setCurrentIcon] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen && category) {
      setFormData({
        id: category.id,
        nombre: category.nombre,
        descripcion: category.descripcion,
        icono: category.icono || null,
        estado: category.estado
      });
      setCurrentIcon(category.icono || null);
      setErrors({
        nombre: '',
        descripcion: ''
      });
      setTouched({
        nombre: false,
        descripcion: false
      });
    }
  }, [isOpen, category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'nombre' || name === 'descripcion') {
      if (hasSpecialChars(value)) return;
      if (name === 'nombre' && hasNumbers(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validación en tiempo real con notificaciones
    if (name === 'nombre') {
      validateNombreWithNotification({ nombre: value, descripcion: formData.descripcion }, setErrors, setTouched);
    } else if (name === 'descripcion') {
      validateDescripcionWithNotification({ nombre: formData.nombre, descripcion: value }, setErrors, setTouched);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, icono: file }));
    setCurrentIcon(file);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validación al perder el foco
    if (name === 'nombre') {
      validateNombreWithNotification(formData, setErrors, setTouched);
    } else if (name === 'descripcion') {
      validateDescripcionWithNotification(formData, setErrors, setTouched);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Usar la nueva función de validación con notificaciones
    const isValid = validateFormWithNotification(formData, setErrors, setTouched);

    if (isValid) {
      onSave(formData);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const removeIcon = () => {
    setFormData(prev => ({ ...prev, icono: null }));
    setCurrentIcon(null);
  };

  return {
    formData,
    errors,
    touched,
    currentIcon,
    handleInputChange,
    handleIconChange,
    handleBlur,
    handleSubmit,
    removeIcon
  };
};

// Hook para el formulario de Ver 
export const useViewCategory = (category: Category | null) => {
  const [currentIcon, setCurrentIcon] = useState<File | string | null>(null); 

  useEffect(() => {
    if (category) {
      setCurrentIcon(category.icono || null);
    }
  }, [category]);

  return {
    currentIcon
  };
};