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
import { showWarning } from "@/shared/utils/notifications";
import { useUser } from "../hooks/useUsers";
import { useRoles } from "./useRoles";

export const useEditUserForm = ({
  isOpen,
  onClose,
  onSave,
  user,
}: EditUserModalProps) => {
  const { users } = useUser();
  const { roles } = useRoles();

  const [originalCV, setOriginalCV] = useState<string | null>(null);
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

  // 🔹 Obtener nombre del rol actual
  const getRoleName = (roleId: number): string => {
    const found = roles.find((r) => r.roleconfigurationid === roleId);
    return found?.role?.name?.toLowerCase() || "";
  };

  // 🔹 Subida de imagen a Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const CLOUD_NAME = "ditjhxzre";
    const UPLOAD_PRESET = "Vertecx";
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("resource_type", "image");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message);
      return json.secure_url;
    } catch (error) {
      console.error("Error al subir imagen:", error);
      showWarning("Error al subir la imagen");
      return null;
    }
  };

  // 🔹 Subida de CV a Cloudinary
  const uploadCVToCloudinary = async (file: File): Promise<string | null> => {
    const CLOUD_NAME = "ditjhxzre";
    const UPLOAD_PRESET = "Vertecx";
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        { method: "POST", body: data }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message);
      return json.secure_url;
    } catch (error) {
      console.error("Error al subir CV:", error);
      showWarning("Error al subir el CV");
      return null;
    }
  };

  // 🔹 Manejar cambios de input
  const handleInputChange = (
    field: keyof EditUser,
    value: string | number | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      const strValue = typeof value === "string" ? value : String(value ?? "");
      validateFieldOnChange(field as string, strValue);
    }
  };

  // 🔹 Manejar cambios de tipos de técnico
  const handleTechnicianTypeChange = (typeId: number, checked: boolean) => {
    setFormData((prev) => {
      const current = prev.techniciantypeids || [];
      if (checked) {
        return { ...prev, techniciantypeids: [...current, typeId] };
      } else {
        return {
          ...prev,
          techniciantypeids: current.filter((id) => id !== typeId),
        };
      }
    });
  };

  // 🔹 Manejar imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 🔹 Manejar CV
  const handleCVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, CV: file }));
      setPreviewCV(file.name);
    }
  };

  // 🔹 Eliminar imagen
  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreviewImage(null);
  };

  // 🔹 Eliminar CV
  const removeCV = () => {
    setFormData((prev) => ({ ...prev, CV: null }));
    setPreviewCV(null);
  };

  // 🔹 Validar campo al perder foco
  const handleBlur = (field: keyof FormTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = formData[field as keyof EditUser];
    if (typeof value === "string") {
      validateFieldOnChange(field as string, value);
    }
  };

  // 🔹 Validar campo individual
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
      true
    );
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // 🔹 Enviar formulario
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
      true
    );

    if (!valid) return;

    try {
      setIsSubmitting(true);

      // Subir imagen si es archivo
      let imageUrl: string | null = null;
      if (formData.image instanceof File) {
        imageUrl = await uploadToCloudinary(formData.image);
      } else if (typeof formData.image === "string") {
        imageUrl = formData.image;
      }

      // Subir CV si es archivo
      let cvUrl: string | null = originalCV;
      if (formData.CV instanceof File) {
        cvUrl = await uploadCVToCloudinary(formData.CV);
      }

      const payload = {
        ...formData,
        image: imageUrl,
        CV: cvUrl,
        techniciantypeids: formData.techniciantypeids?.length
          ? formData.techniciantypeids
          : undefined,
        customercity: formData.customercity?.trim()
          ? formData.customercity
          : undefined,
        customerzipcode: formData.customerzipcode?.trim()
          ? formData.customerzipcode
          : undefined,
      };

      await onSave(payload);
      setTimeout(onClose, 800);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      showWarning("Error al actualizar el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔹 Cargar datos del usuario
  useEffect(() => {
    if (isOpen && user) {
      const technician = user.technicians?.[0];
      const customer = user.customers?.[0];
      const currentCV = technician?.CV || null;

      setOriginalCV(currentCV);

      setFormData({
        userid: user.userid!,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        documentnumber: user.documentnumber,
        typeid: user.typeid,
        image: user.image ?? null,
        stateid: user.stateid,
        roleconfigurationid: user.roleconfigurationid,
        CV: currentCV,
        techniciantypeids:
          technician?.technicianTypeMaps?.map((tm) => tm.techniciantypeid) || [],
        customercity: customer?.customercity || "",
        customerzipcode: customer?.customerzipcode || "",
      });

      if (currentCV && typeof currentCV === "string") {
        setPreviewCV(currentCV);
      } else {
        setPreviewCV(null);
      }


      // Resetear errores y touched
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
    }
  }, [isOpen, user]);

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
