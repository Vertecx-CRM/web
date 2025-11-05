import { showWarning } from "@/shared/utils/notifications";
import { User, FormErrors, FormTouched } from "../types/typesUser";

export const validateField = (
  fieldName: string,
  value: string,
  formData: User,
  isEditMode: boolean = false
): string => {
  let error = "";
  const specialChars = /[@,.;:\-_\{\[\}^\]`+*~´¨¡¿'\\?=)(/&%$#"!°|¬<>ç]/;

  switch (fieldName) {
    case "typeid":
      if (!String(value).trim()) error = "El tipo de documento es obligatorio";
      break;

    case "documentnumber":
      if (!value.trim()) {
        error = "El número de documento es obligatorio";
      } else if (!/^\d+$/.test(value)) {
        error = "El documento solo puede contener números";
      } else if (value.length < 5 || value.length > 20) {
        error = "El documento debe tener entre 5 y 20 dígitos";
      }
      break;

    case "name":
      if (!value.trim()) {
        error = "El nombre es obligatorio";
      } else if (/[0-9]/.test(value)) {
        error = "El nombre no puede contener números";
      } else if (specialChars.test(value)) {
        error = "El nombre no puede contener caracteres especiales";
      }
      break;

    case "lastname":
      if (!value.trim()) {
        error = "El apellido es obligatorio";
      } else if (/[0-9]/.test(value)) {
        error = "El apellido no puede contener números";
      } else if (specialChars.test(value)) {
        error = "El apellido no puede contener caracteres especiales";
      }
      break;

    case "phone":
      if (!value.trim()) {
        error = "El teléfono es obligatorio";
      } else if (!/^\d+$/.test(value)) {
        error = "El teléfono solo puede contener números";
      } else if (value.length < 7 || value.length > 15) {
        error = "El teléfono debe tener entre 7 y 15 dígitos";
      }
      break;

    case "email":
      if (!value.trim()) {
        error = "El correo electrónico es obligatorio";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "El formato del correo no es válido";
      }
      break;

    // ✅ Eliminamos validación de contraseña para creación de usuario
    case "password":
    case "confirmPassword":
      // Solo se valida si estamos en modo edición y el campo viene con valor
      if (isEditMode && value.trim()) {
        if (value.length < 6) {
          error = "La contraseña debe tener al menos 6 caracteres";
        } else if (
          value &&
          formData.confirmPassword &&
          value !== formData.confirmPassword
        ) {
          error = "Las contraseñas no coinciden";
        }
      }
      break;

    case "stateid":
      if (!String(value).trim()) error = "El estado es obligatorio";
      break;

    case "roleconfigurationid":
      if (!String(value).trim() || value === "0") {
        error = "El rol es obligatorio";
      }
      break;

    default:
      break;
  }

  return error;
};

// 🧩 Validación de todo el formulario
export const validateAllFields = (
  formData: User,
  isEditMode: boolean = false
): FormErrors => {
  const formDataWithDefaults = {
    ...formData,
    lastname: formData.lastname || "",
    password: formData.password || "",
    confirmPassword: formData.confirmPassword || "",
  };

  const errors: FormErrors = {
    userid: "",
    name: validateField("name", formData.name, formDataWithDefaults, isEditMode),
    lastname: validateField("lastname", formData.lastname || "", formDataWithDefaults, isEditMode),
    email: validateField("email", formData.email, formDataWithDefaults, isEditMode),
    password: validateField("password", formData.password || "", formDataWithDefaults, isEditMode),
    confirmPassword: validateField("confirmPassword", formData.confirmPassword || "", formDataWithDefaults, isEditMode),
    phone: validateField("phone", formData.phone, formDataWithDefaults, isEditMode),
    documentnumber: validateField("documentnumber", formData.documentnumber, formDataWithDefaults, isEditMode),
    typeid: validateField("typeid", String(formData.typeid || ""), formDataWithDefaults, isEditMode),
    stateid: validateField("stateid", String(formData.stateid || ""), formDataWithDefaults, isEditMode),
    image: "",
    roleconfigurationid: validateField("roleconfigurationid", String(formData.roleconfigurationid || ""), formDataWithDefaults, isEditMode), // 👈 agregado
  };


  return errors;
};

// 🧩 Verifica si hay errores
export const hasErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some((e) => e !== "");
};

// 🧩 Valida todo el formulario con notificación
export const validateFormWithNotification = (
  formData: User,
  setErrors: (errors: FormErrors) => void,
  setTouched: (touched: FormTouched) => void,
  isEditMode: boolean = false
): boolean => {
  const validationData = isEditMode
    ? { ...formData }
    : { ...formData, password: "", confirmPassword: "" };

  const newErrors = validateAllFields(validationData, isEditMode);
  setErrors(newErrors);

  const allTouched: FormTouched = {
    userid: false,
    name: true,
    lastname: true,
    email: true,
    password: isEditMode,
    confirmPassword: isEditMode,
    phone: true,
    documentnumber: true,
    typeid: true,
    stateid: true,
    image: true,
    roleconfigurationid: true,
  };

  setTouched(allTouched);

  const hasRelevantErrors = Object.values(newErrors).some((e) => e !== "");

  if (hasRelevantErrors) {
    showWarning("Por favor complete los campos correctamente");
    const firstError = Object.values(newErrors).find((e) => e !== "");
    if (firstError) setTimeout(() => showWarning(firstError), 100);
    return false;
  }

  return true;
};
