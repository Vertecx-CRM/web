import { useState, useEffect } from "react";
import {
  EditCategoryData,
  EditCategoryModalProps,
  FormErrors,
  FormTouched,
} from "../types/typeCategoryProducts";
import {
  hasNumbers,
  hasSpecialChars,
  validateFormWithNotification,
  isDuplicateName,
} from "../validations/categoryValidations";
import { showWarning, showSuccess } from "@/shared/utils/notifications";

export const useEditCategoryForm = ({
  isOpen,
  category,
  onClose,
  onSave,
  categories
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

  useEffect(() => {
    if (category) {
      setFormData({ ...category });

      if (category.icon) {
        if (typeof category.icon === "string") {
          setPreviewIcon(category.icon);
        } else if (category.icon instanceof File) {
          setPreviewIcon(URL.createObjectURL(category.icon));
        }
      } else {
        setPreviewIcon(null);
      }
    }
  }, [category, isOpen]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "name" || name === "description") {
      if (hasSpecialChars(value)) return;
      if (name === "name" && hasNumbers(value)) return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const CLOUD_NAME = "ditjhxzre";
    const UPLOAD_PRESET = "Vertecx";
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message);
      return json.secure_url;
    } catch (error) {
      console.error(error);
      showWarning("Error al subir la imagen a Cloudinary");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateFormWithNotification(formData, setErrors, setTouched);
    if (!isValid) return;

    if (isDuplicateName(formData.name, categories, formData.id)) {
      showWarning("Ya existe una categoría con ese nombre. Por favor, elige otro.");
      return;
    }

    let iconUrl: string | null = null;

    if (formData.icon instanceof File) {
      iconUrl = await uploadToCloudinary(formData.icon);
    } else if (typeof formData.icon === "string") {
      iconUrl = formData.icon;
    }

    onSave({
      ...formData,
      icon: iconUrl,
    });

    onClose();
  };

  return {
    formData,
    errors,
    touched,
    previewIcon,
    handleInputChange,
    handleIconChange,
    handleBlur,
    handleSubmit,
    removeIcon,
  };
};
