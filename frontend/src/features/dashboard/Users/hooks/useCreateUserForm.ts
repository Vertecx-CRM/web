import { useState, useEffect } from "react";
import { showWarning } from "@/shared/utils/notifications";
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
import { useDocumentTypes } from "./useDocumentTypes";

export const useCreateUserForm = ({
  isOpen,
  onClose,
  onSave,
}: CreateUserModalProps) => {
  const { users } = useUser();
  const { roles } = useRoles();
  const { documentTypes } = useDocumentTypes();

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
  const [isNit, setIsNit] = useState(false);

  const getRoleName = (roleId: number): string => {
    const found = roles.find((r) => r.roleconfigurationid === roleId);
    return found?.role?.name.toLowerCase() || "";
  };

  /** 🔹 Detectar si el tipo de documento seleccionado es NIT */
  useEffect(() => {
    if (formData.typeid !== 0 && documentTypes.length > 0) {
      const selectedDoc = documentTypes.find(
        (d) => d.typeofdocumentid === formData.typeid
      );
      setIsNit(selectedDoc?.name?.toUpperCase() === "NIT");
    } else {
      setIsNit(false);
    }
  }, [formData.typeid, documentTypes]);

  /** 🔹 Aplicar ajustes automáticos si es NIT */
  useEffect(() => {
    if (isNit) {
      const clienteRole = roles.find(
        (r) => r.role?.name?.toLowerCase() === "cliente"
      );

      setFormData((prev) => ({
        ...prev,
        lastname: "",
        roleconfigurationid:
          clienteRole?.roleconfigurationid || prev.roleconfigurationid,
      }));
    }
  }, [isNit, roles]);

  /** 🔹 Subida de imagen a Cloudinary */
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
      console.error("Error al subir imagen:", error);
      showWarning("Error al subir la imagen");
      return null;
    }
  };

  /** 🔹 Subida de CV */
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

  /** 🔹 Manejar cambios */
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

  const handleTechnicianTypeChange = (typeId: number, checked: boolean) => {
    setFormData((prev) => {
      const current = prev.techniciantypeids || [];
      return {
        ...prev,
        techniciantypeids: checked
          ? [...current, typeId]
          : current.filter((id) => id !== typeId),
      };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleCVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, CV: file }));
      setPreviewCV(file.name);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreviewImage(null);
  };

  const removeCV = () => {
    setFormData((prev) => ({ ...prev, CV: null }));
    setPreviewCV(null);
  };

  /** 🔹 Validación individual */
  const handleBlur = (field: keyof FormTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = formData[field as keyof CreateUserData];
    if (typeof value === "string") {
      validateFieldOnChange(field as string, value);
    }
  };

  const validateFieldOnChange = (field: string, value: string) => {
    const selectedDoc = documentTypes.find(
      (d) => d.typeofdocumentid === formData.typeid
    );

    const error = validateField(
      field,
      value,
      {
        ...formData,
        typeofdocuments: { name: selectedDoc?.name || "" }, // 👈 importante para detectar NIT
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

  /** 🔹 Envío del formulario */
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const selectedDoc = documentTypes.find(
      (d) => d.typeofdocumentid === formData.typeid
    );

    const valid = validateFormWithNotification(
      {
        ...formData,
        typeofdocuments: { name: selectedDoc?.name || "" },
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

      let imageUrl: string | null = null;
      if (formData.image instanceof File)
        imageUrl = await uploadToCloudinary(formData.image);

      let cvUrl: string | null = null;
      if (formData.CV instanceof File)
        cvUrl = await uploadCVToCloudinary(formData.CV);
      else if (typeof formData.CV === "string") cvUrl = formData.CV;

      const payload = {
        ...formData,
        image: imageUrl,
        CV: cvUrl,
        techniciantypeids: formData.techniciantypeids?.length
          ? formData.techniciantypeids
          : undefined,
        customercity: formData.customercity?.trim() || undefined,
        customerzipcode: formData.customerzipcode?.trim() || undefined,
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

  /** 🔹 Reset al abrir modal */
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
      setIsNit(false);
    }
  }, [isOpen]);

  return {
    formData,
    errors,
    touched,
    previewImage,
    previewCV,
    isSubmitting,
    isNit,
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
