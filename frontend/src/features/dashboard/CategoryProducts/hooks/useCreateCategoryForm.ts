import { useState, useEffect } from "react";
import {
  CreateCategoryModalProps,
  CreateCategoryData,
  FormErrors,
  FormTouched,
} from "../types/typeCategoryProducts";
import {
  validateField,
  validateFormWithNotification,
} from "../validations/categoryValidations";
import { showWarning } from "@/shared/utils/notifications";

export const useCreateCategoryForm = ({
  isOpen,
  onClose,
  onSave,
  categories,
}: CreateCategoryModalProps) => {
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: "",
    description: "",
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

  // Reiniciar formulario al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", description: "", icon: null });
      setErrors({ name: "", description: "" });
      setTouched({ name: false, description: false });
    }
  }, [isOpen]);

  // Validacion en tiempo real (incluye nombre duplicado)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name as keyof FormTouched]) {
      const error = validateField(name, value, categories);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Validacion al salir del campo
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value, categories);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Subir imagen a Cloudinary
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, icon: file }));
  };

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

  // Envio del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validacion global con notificacion (solo al guardar)
    const valid = validateFormWithNotification(
      formData,
      setErrors,
      setTouched,
      categories
    );
    if (!valid) return;

    try {
      let iconUrl: string | null = null;
      if (formData.icon instanceof File) {
        iconUrl = await uploadToCloudinary(formData.icon);
      }

      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: iconUrl,
      });
    } catch (error) {
      console.error(error);
      showWarning("Error al guardar la categoria");
    }
  };

  return {
    formData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    handleIconChange,
    handleSubmit,
  };
};
