import { useState, useEffect } from "react";
import { showWarning, showSuccess } from "@/shared/utils/notifications";
import {
  CreateUserModalProps,
  CreateUserData,
  FormErrors,
  FormTouched,
  User,
} from "../types/typesUser";
import {
  validateField,
  validateFormWithNotification,
} from "../Validations/UserValidations";
import { useUser } from "../hooks/useUsers";

export const useCreateUserForm = ({
  isOpen,
  onClose,
  onSave,
}: CreateUserModalProps) => {
  // Traemos usuarios existentes del hook principal
  const { users } = useUser();

  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    typeid: 0,
    documentnumber: "",
    image: null,
    stateid: 1,
    roleconfigurationid: 0,
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
    roleconfigurationid: "",
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
    roleconfigurationid: false,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subida de imagen a Cloudinary
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

  // Cambio de inputs con validación instantánea
  const handleInputChange = (
    field: keyof CreateUserData,
    value: string | number | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      const strValue = typeof value === "string" ? value : String(value ?? "");
      validateFieldOnChange(field, strValue);
    }
  };

  //  Subida de imagen local
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Eliminar imagen
  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreviewImage(null);
  };

  // Validar campo individual en blur
  const handleBlur = (field: keyof FormTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = formData[field as keyof CreateUserData];
    if (typeof value === "string") validateFieldOnChange(field, value);
  };

  // Validar campo individual
  const validateFieldOnChange = (field: string, value: string) => {
    const error = validateField(field, value, formData as unknown as User, users, false);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Envío del formulario
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const valid = validateFormWithNotification(
      formData as unknown as User,
      users,
      setErrors,
      setTouched,
      false
    );
    if (!valid) return;

    try {
      setIsSubmitting(true);

      let imageUrl: string | null = null;
      if (formData.image instanceof File) {
        imageUrl = await uploadToCloudinary(formData.image);
      }

      await onSave({ ...formData, image: imageUrl });
      setTimeout(onClose, 800);
    } catch (err) {
      console.error(err);
      showWarning("Error al guardar el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset al abrir modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        lastname: "",
        email: "",
        phone: "",
        typeid: 0,
        documentnumber: "",
        image: null,
        stateid: 1,
        roleconfigurationid: 0,
      });
      setErrors({
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
        roleconfigurationid: "",
      });
      setTouched({
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
        roleconfigurationid: false,
      });
      setPreviewImage(null);
    }
  }, [isOpen]);

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
