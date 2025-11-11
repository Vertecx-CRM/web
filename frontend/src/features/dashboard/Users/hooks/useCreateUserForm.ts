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
import { useRoles } from "./useRoles";


export const useCreateUserForm = ({
  isOpen,
  onClose,
  onSave,
}: CreateUserModalProps) => {
  // Traemos usuarios existentes del hook principal (para validación de duplicados)
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
    // Campos condicionales
    CV: null,
    techniciantypeids: [],
    customercity: "",
    customerzipcode: "",
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
    CV: "",
    techniciantypeids: "",
    customercity: "",
    customerzipcode: "",
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
    CV: false,
    techniciantypeids: false,
    customercity: false,
    customerzipcode: false,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewCV, setPreviewCV] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { roles } = useRoles();

  const getRoleName = (roleId: number): string => {
    const found = roles.find(r => r.roleconfigurationid === roleId);
    
    return found?.role?.name.toLowerCase() || '';
  };


  // Subida de imagen a Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const CLOUD_NAME = "ditjhxzre";
    const UPLOAD_PRESET = "Vertecx";
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("resource_type", "auto");
    data.append("resource_type", "raw");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message);
      return json.secure_url;
    } catch (error) {
      console.error("Error al subir a Cloudinary:", error);
      showWarning("Error al subir la imagen");
      return null;
    }
  };

  // Subida de CV (archivos: PDF, DOC, etc.) a Cloudinary
  const uploadCVToCloudinary = async (file: File): Promise<string | null> => {
    const CLOUD_NAME = "ditjhxzre";
    const UPLOAD_PRESET = "Vertecx";
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      // Usa "auto/upload" para permitir archivos no de imagen
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        { method: "POST", body: data }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message);
      return json.secure_url;
    } catch (error) {
      console.error("Error al subir CV a Cloudinary:", error);
      showWarning("Error al subir el CV");
      return null;
    }
  };

  // Maneja cambios en inputs normales
  const handleInputChange = (
    field: keyof CreateUserData,
    value: string | number | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (touched[field as keyof FormTouched]) {
      const strValue = typeof value === "string" ? value : String(value ?? "");
      validateFieldOnChange(field as string, strValue);
    }
  };

  // Maneja cambios en el checkbox de tipos de técnico
  const handleTechnicianTypeChange = (typeId: number, checked: boolean) => {
    setFormData((prev) => {
      const current = prev.techniciantypeids || [];
      if (checked) {
        return { ...prev, techniciantypeids: [...current, typeId] };
      } else {
        return { ...prev, techniciantypeids: current.filter((id) => id !== typeId) };
      }
    });
  };

  // Cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Cambio de CV
  const handleCVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, CV: file }));
      setPreviewCV(file.name); // Mostrar nombre del archivo
    }
  };

  // Eliminar imagen
  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreviewImage(null);
  };

  // Eliminar CV
  const removeCV = () => {
    setFormData((prev) => ({ ...prev, CV: null }));
    setPreviewCV(null);
  };

  // Validar campo en blur
  const handleBlur = (field: keyof FormTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = formData[field as keyof CreateUserData];
    if (typeof value === "string") {
      validateFieldOnChange(field as string, value);
    }
  };

  // Validar campo individual
  const validateFieldOnChange = (field: string, value: string) => {
    const error = validateField(
      field,
      value,
      {
        ...formData,
        roleconfiguration: {
          roleconfigurationid: formData.roleconfigurationid,
          roles: { name: getRoleName(formData.roleconfigurationid) },
        },
      } as unknown as User,
      users,
      false
    );


    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Envío del formulario
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const valid = validateFormWithNotification(
      {
        ...formData,
        roleconfiguration: {
          roleconfigurationid: formData.roleconfigurationid,
          roles: { name: getRoleName(formData.roleconfigurationid) },
        },
      } as unknown as User,
      users,
      setErrors,
      setTouched,
      false
    );


    if (!valid) return;

    try {
      setIsSubmitting(true);

      // Subir imagen si es un archivo
      let imageUrl: string | null = null;
      if (formData.image instanceof File) {
        imageUrl = await uploadToCloudinary(formData.image);
      }

      // Subir CV si es un archivo
      let cvUrl: string | null = null;
      if (formData.CV instanceof File) {
        cvUrl = await uploadCVToCloudinary(formData.CV);
      } else if (typeof formData.CV === "string") {
        cvUrl = formData.CV; // Mantener URL existente
      }

      // Aseguramos que los campos condicionales se envíen correctamente
      const payload = {
        ...formData,
        image: imageUrl,
        CV: cvUrl,
        // Limpieza: evitar enviar datos vacíos innecesarios
        techniciantypeids: formData.techniciantypeids?.length ? formData.techniciantypeids : undefined,
        customercity: formData.customercity?.trim() ? formData.customercity : undefined,
        customerzipcode: formData.customerzipcode?.trim() ? formData.customerzipcode : undefined,
      };

      await onSave(payload);
      setTimeout(onClose, 800);
    } catch (err) {
      console.error("Error al crear usuario:", err);
      showWarning("Error al guardar el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset al abrir el modal
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
        CV: null,
        techniciantypeids: [],
        customercity: "",
        customerzipcode: "",
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
        CV: "",
        techniciantypeids: "",
        customercity: "",
        customerzipcode: "",
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
        CV: false,
        techniciantypeids: false,
        customercity: false,
        customerzipcode: false,
      });
      setPreviewImage(null);
      setPreviewCV(null);
    }
  }, [isOpen]);

  return {
    formData,
    errors,
    touched,
    previewImage,
    previewCV,
    isSubmitting,
    handleInputChange,
    handleImageChange,
    handleCVChange,
    handleBlur,
    handleSubmit,
    removeImage,
    removeCV,
    handleTechnicianTypeChange,
  };
};