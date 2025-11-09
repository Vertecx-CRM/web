import { useState, useEffect } from "react";
import {
  EditCategoryData,
  EditCategoryModalProps,
  FormErrors,
  FormTouched,
} from "../types/typeCategoryProducts";
import {
  validateField,
  validateFormWithNotification,
} from "../validations/categoryValidations";
import { showWarning, showSuccess } from "@/shared/utils/notifications";

export const useEditCategoryForm = ({
  isOpen,
  category,
  onClose,
  onSave,
  categories,
}: EditCategoryModalProps) => {
  const [formData, setFormData] = useState<EditCategoryData>({
    id: 0,
    name: "",
    description: "",
    status: true,
    icon: null,
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    description: "",
  });

  const [touched, setTouched] = useState<FormTouched>({
    name: false,
    description: false,
  });

  const [previewIcon, setPreviewIcon] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen && category) {
      setFormData({
        id: category.id,
        name: category.name,
        description: category.description,
        status: category.status,
        icon: category.icon || null,
      });

      // Mostrar ícono actual
      if (category.icon) {
        if (typeof category.icon === "string") {
          setPreviewIcon(category.icon);
        } else if (category.icon instanceof File) {
          setPreviewIcon(URL.createObjectURL(category.icon));
        }
      } else {
        setPreviewIcon(null);
      }

      // Reiniciar validaciones
      setErrors({ name: "", description: "" });
      setTouched({ name: false, description: false });
    }
  }, [isOpen, category]);

  // ✅ Validación en tiempo real (incluye nombre duplicado)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name as keyof FormTouched]) {
      const error = validateField(name, value, categories, formData.id);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // ✅ Validación al salir del campo
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value, categories, formData.id);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // ✅ Cambiar ícono y vista previa
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, icon: file }));
      setPreviewIcon(URL.createObjectURL(file));
    }
  };

  const removeIcon = () => {
    setFormData((prev) => ({ ...prev, icon: null }));
    setPreviewIcon(null);
  };

  // ☁️ Subir imagen a Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const CLOUD_NAME = "ditjhxzre";
    const UPLOAD_PRESET = "Vertecx";
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message);
      return json.secure_url;
    } catch (error) {
      console.error(error);
      showWarning("Error al subir la imagen a Cloudinary");
      return null;
    }
  };

  // 💾 Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valid = validateFormWithNotification(
      formData,
      setErrors,
      setTouched,
      categories,
      formData.id
    );
    if (!valid) return;

    try {
      setIsSubmitting(true);

      let iconUrl: string | null = null;
      if (formData.icon instanceof File) {
        iconUrl = await uploadToCloudinary(formData.icon);
      } else if (typeof formData.icon === "string") {
        iconUrl = formData.icon;
      }

      await onSave({
        ...formData,
        icon: iconUrl,
      });
      setTimeout(onClose, 800);
    } catch (error) {
      console.error(error);
      showWarning("Error al actualizar la categoría.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    touched,
    previewIcon,
    isSubmitting,
    handleInputChange,
    handleIconChange,
    handleBlur,
    handleSubmit,
    removeIcon,
  };
};
