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
import { useRoles } from "./useRoles";

export const useCreateUserForm = ({
  isOpen,
  onClose,
  onSave,
  users,
}: CreateUserModalProps) => {
  const { roles } = useRoles();

  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    typeid: 0,
    documentnumber: "",
    image: null,
    stateid: 1,
    roleid: 0,
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
    roleid: "",
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
    roleid: false,
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
    const found = roles.find((r) => r.roleid === roleId);
    return found?.name?.toLowerCase() || "";
  };

  useEffect(() => {
    setIsNit(formData.typeid === 4);
  }, [formData.typeid]);

  useEffect(() => {
    if (isNit) {
      const clienteRole = roles.find(
        (r) => r.name?.toLowerCase() === "cliente"
      );

      setFormData((prev) => ({
        ...prev,
        lastname: "",
        roleid: clienteRole?.roleid || prev.roleid,
      }));
    }
  }, [isNit, roles]);

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

  const handleInputChange = (
    field: keyof CreateUserData,
    value: string | number | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
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

  const handleBlur = (field: keyof FormTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = formData[field as keyof CreateUserData];
    if (typeof value === "string" || typeof value === "number") {
      validateFieldOnChange(field as string, String(value));
    }
  };

  const validateFieldOnChange = (field: string, value: string) => {
    const error = validateField(
      field,
      value,
      {
        ...formData,
        roles: { roleid: formData.roleid, name: getRoleName(formData.roleid) },
      } as unknown as User,
      users,
      false
    );

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const valid = validateFormWithNotification(
      {
        ...formData,
        roles: { roleid: formData.roleid, name: getRoleName(formData.roleid) },
      } as unknown as User,
      users,
      setErrors,
      setTouched,
      false
    );

    if (!valid) return;

    try {
      setIsSubmitting(true);
      onClose();

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
    } catch (err) {
      console.error("Error al crear usuario:", err);
      showWarning("Error al guardar el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        roleid: 0,
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
        roleid: "",
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
        roleid: false,
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
