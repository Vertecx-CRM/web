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
import { useDocumentTypes } from "./useDocumentTypes";

export const useEditUserForm = ({
  isOpen,
  onClose,
  onSave,
  user,
}: EditUserModalProps) => {
  const { users } = useUser();
  const { roles } = useRoles();
  const { documentTypes } = useDocumentTypes();

  const [originalCV, setOriginalCV] = useState<string | null>(null);
  const [isNit, setIsNit] = useState<boolean>(false);
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

  const [errors, setErrors] = useState<FormErrors>({} as FormErrors);
  const [touched, setTouched] = useState<FormTouched>({} as FormTouched);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewCV, setPreviewCV] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detectar si el tipo de documento seleccionado es NIT
  const checkIfNit = (typeId: number): boolean => {
    const doc = documentTypes.find((d) => d.typeofdocumentid === typeId);
    return doc?.name?.toUpperCase() === "NIT";
  };

  const getRoleName = (roleId: number): string => {
    const found = roles.find((r) => r.roleconfigurationid === roleId);
    return found?.role?.name?.toLowerCase() || "";
  };

  // Subida de imagen a Cloudinary
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

  // Subida de CV a Cloudinary
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

  // Manejar cambios en inputs
  const handleInputChange = (
    field: keyof EditUser,
    value: string | number | File | null
  ) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Detectar cambio de tipo de documento → verificar si es NIT
      if (field === "typeid" && typeof value === "number") {
        const isNitDoc = checkIfNit(value);
        setIsNit(isNitDoc);

        if (isNitDoc) {
          newData.lastname = "";
          // Cambiar automáticamente rol a Cliente
          const clienteRole = roles.find(
            (r) => r.role?.name?.toLowerCase() === "cliente"
          );
          if (clienteRole) {
            newData.roleconfigurationid = clienteRole.roleconfigurationid;
          }
        }
      }

      return newData;
    });

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
    const value = formData[field as keyof EditUser];
    if (typeof value === "string") {
      validateFieldOnChange(field as string, value);
    }
  };

  const validateFieldOnChange = (field: string, value: string) => {
    if (isNit && field === "lastname") return;
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

      let imageUrl: string | null = null;
      if (formData.image instanceof File) {
        imageUrl = await uploadToCloudinary(formData.image);
      } else if (typeof formData.image === "string") {
        imageUrl = formData.image;
      }

      let cvUrl: string | null = originalCV;
      if (formData.CV instanceof File) {
        cvUrl = await uploadCVToCloudinary(formData.CV);
      }

      const payload = {
        ...formData,
        lastname: isNit ? null : formData.lastname,
        image: imageUrl,
        CV: cvUrl,
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

  useEffect(() => {
    if (isOpen && user) {
      const technician = user.technicians?.[0];
      const customer = user.customers?.[0];
      const currentCV = technician?.CV || null;

      setOriginalCV(currentCV);
      setIsNit(user.typeofdocuments?.name?.toUpperCase() === "NIT");

      setFormData({
        userid: user.userid!,
        name: user.name,
        lastname: user.lastname || "",
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
    }
  }, [isOpen, user]);

  return {
    formData,
    errors,
    touched,
    isNit,
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
