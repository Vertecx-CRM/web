import { useState, useEffect } from "react";
import {
  EditUserModalProps,
  EditUser,
  FormErrors,
  FormTouched,
  User,
} from "../types/typesUser";
import {
  validateField,
  validateFormWithNotification,
} from "../Validations/UserValidations";
import { showWarning, showSuccess } from "@/shared/utils/notifications";
import { useUser } from "../hooks/useUsers"; // ✅ Usamos lista de usuarios locales

export const useEditUserForm = ({
  isOpen,
  onClose,
  onSave,
  user,
}: EditUserModalProps) => {
  const { users } = useUser(); // ✅ Traemos todos los usuarios para validar duplicados

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

  // ☁️ Subida a Cloudinary
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

  // ✍️ Cambio de inputs con validación dinámica
  const handleInputChange = (
    field: keyof EditUser,
    value: string | File | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      const strValue = typeof value === "string" ? value : String(value ?? "");
      validateFieldOnChange(field, strValue);
    }
  };

  // 📸 Subida o vista previa de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // ❌ Eliminar imagen
  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreviewImage(null);
  };

  // 📋 Validación individual al salir del campo
  const handleBlur = (field: keyof FormTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = formData[field as keyof EditUser];
    if (typeof value === "string") validateFieldOnChange(field, value);
  };

  // ⚙️ Validar campo individual
  const validateFieldOnChange = (field: string, value: string) => {
    const error = validateField(
      field,
      value,
      formData as unknown as User,
      users,
      true // isEditMode = true
    );
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // 💾 Envío del formulario (actualización)
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const valid = validateFormWithNotification(
      formData as unknown as User,
      users,
      setErrors,
      setTouched,
      true // isEditMode = true
    );
    if (!valid) return;

    try {
      setIsSubmitting(true);

      // Subir imagen si es un nuevo archivo
      let imageUrl: string | null = null;
      if (formData.image instanceof File) {
        imageUrl = await uploadToCloudinary(formData.image);
      } else if (typeof formData.image === "string") {
        imageUrl = formData.image;
      }

      await onSave({ ...formData, image: imageUrl });
      setTimeout(onClose, 800);
    } catch (error) {
      console.error(error);
      showWarning("Error al actualizar el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔁 Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        ...user,
        image: user.image ?? null,
        roleconfigurationid: user.roleconfigurationid ?? 0,
      });

      if (user.image) {
        if (typeof user.image === "string") {
          setPreviewImage(user.image);
        } else if (user.image instanceof File) {
          setPreviewImage(URL.createObjectURL(user.image));
        }
      } else {
        setPreviewImage(null);
      }

      // Reinicia errores y touched
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
