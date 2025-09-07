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

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EditCategoryData | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  const handleCreateCategory = (categoryData: CreateCategoryData) => {
    const newCategory: Category = {
      id: Math.max(...categories.map(c => c.id)) + 1,
      nombre: categoryData.nombre,
      descripcion: categoryData.descripcion,
      estado: "Activo",
      icono: categoryData.icono
    };

    setCategories(prev => [...prev, newCategory]);
    setIsCreateModalOpen(false);

    showSuccess('Categoría de producto creada exitosamente!');
  };

  const handleEditCategory = (id: number, categoryData: EditCategoryData) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === id
          ? { ...category, ...categoryData }
          : category
      )
    );
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
        setCategories(prev => prev.filter(c => c.id !== category.id));
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
    setViewingCategory
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
  const [currentIcon, setCurrentIcon] = useState<File | null>(null);

  useEffect(() => {
    if (category) {
      setCurrentIcon(category.icono || null);
    }
  }, [category]);

  return {
    currentIcon
  };
};