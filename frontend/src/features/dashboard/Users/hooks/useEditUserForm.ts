import { useState, useEffect } from "react";
import {
  EditUserModalProps,
  EditUser,
  FormErrors,
  FormTouched,
} from "../types/typesUser";
import {
  validateField,
  validateFormWithNotification,
} from "../Validations/UserValidations";
import { showWarning, showSuccess } from "@/shared/utils/notifications";

export const useEditUserForm = ({
  isOpen,
  onClose,
  onSave,
  user,
}: EditUserModalProps) => {
  const [formData, setFormData] = useState<EditUser>({
    userid: 0,
    name: "",
    lastname: "",
    email: "",
    phone: "",
    documentnumber: "",
    typeid: 0,
    image: null,
    stateid: 1,
  });

  const [errors, setErrors] = useState<FormErrors>({
    userid: "",
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    documentnumber: "",
    typeid: "",
    stateid: "",
    image: "",
  });

  const [touched, setTouched] = useState<FormTouched>({
    userid: false,
    name: false,
    lastname: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
    documentnumber: false,
    typeid: false,
    stateid: false,
    image: false,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📸 Subida a Cloudinary
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

  const handleInputChange = (
    field: keyof EditUser,
    value: string | File | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) validateFieldOnChange(field, String(value ?? ""));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreviewImage(null);
  };

  const handleBlur = (field: keyof FormTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = formData[field as keyof EditUser];
    if (typeof value === "string") validateFieldOnChange(field, value);
  };

  const validateFieldOnChange = (field: string, value: string) => {
    const error = validateField(field, value, formData as any, true);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const valid = validateFormWithNotification(formData as any, setErrors, setTouched, true);
    if (!valid) return;

    try {
      setIsSubmitting(true);
      let imageUrl: string | null = null;

      if (formData.image instanceof File) {
        imageUrl = await uploadToCloudinary(formData.image);
      } else if (typeof formData.image === "string") {
        imageUrl = formData.image;
      }

      await onSave({ ...formData, image: imageUrl });
      showSuccess("Usuario actualizado exitosamente");
      setTimeout(onClose, 800);
    } catch (error) {
      console.error(error);
      showWarning("Error al actualizar el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      setFormData(user);
      if (user.image) {
        if (typeof user.image === "string") {
          setPreviewImage(user.image);
        } else if (user.image instanceof File) {
          setPreviewImage(URL.createObjectURL(user.image));
        }
      } else {
        setPreviewImage(null);
      }
    }
  }, [isOpen, user]);

  return {
    formData,
    errors,
    touched,
    previewImage,
    isSubmitting,
    handleInputChange,
    handleImageChange,
    handleBlur,
    handleSubmit,
    removeImage,
  };
};
