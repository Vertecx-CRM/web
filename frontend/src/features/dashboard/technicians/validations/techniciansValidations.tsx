import { Technician, CreateTechnicianData } from "@/features/dashboard/technicians/types/typesTechnicians";

export interface TechnicianErrors {
  name?: string;
  lastName?: string;
  password?: string;
  confirmPassword?: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
}

export const validateTechnicianField = (
  field: keyof Omit<CreateTechnicianData, "id" | "image" | "state">,
  value: any,
  technicians: Technician[],
  extra?: { password?: string; documentType?: string; id?: number; excludeId?: number }
): string | undefined => {
  const currentId = extra?.excludeId ?? extra?.id;

  switch (field) {
    case "name":
      if (!String(value).trim()) return "El nombre es obligatorio";
      return;

    case "lastName":
      if (!String(value).trim()) return "El apellido es obligatorio";
      return;

    case "password":
      if (currentId) {
        // ✅ Modo edición: solo valida si el usuario escribió algo
        if (String(value).length > 0 && String(value).length < 6)
          return "La contraseña debe tener al menos 6 caracteres";
        return;
      }
      // ✅ Modo creación: siempre obligatorio
      if (!String(value)) return "La contraseña es obligatoria";
      if (String(value).length < 6)
        return "La contraseña debe tener al menos 6 caracteres";
      return;

    case "confirmPassword":
      if (currentId) {
        // ✅ En edición: solo valida si password fue tocada
        if (extra?.password && extra.password.length > 0 && !String(value))
          return "Debe confirmar la nueva contraseña";
        if (extra?.password && extra.password !== value)
          return "Las contraseñas no coinciden";
        return;
      }
      // ✅ En creación: obligatorio
      if (!String(value)) return "Confirmar contraseña es obligatorio";
      if (extra?.password !== value) return "Las contraseñas no coinciden";
      return;

    case "documentType":
      if (!String(value)) return "El tipo de documento es obligatorio";
      return;

    case "documentNumber":
      if (!value || String(value).trim() === "")
        return "El número de documento es obligatorio";
      if (
        technicians.some(
          (t) =>
            t.documentNumber.trim().toLowerCase() ===
              String(value).trim().toLowerCase() && t.id !== currentId
        )
      ) {
        return "Ya existe un técnico con este número de documento";
      }

      if (extra?.documentType) {
        const tipo = extra.documentType;
        const num = String(value).trim();
        if (tipo === "TI") {
          if (!/^\d{10}$/.test(num))
            return "La tarjeta de identidad debe tener 10 dígitos";
        } else if (tipo === "CC") {
          if (!/^\d{7,10}$/.test(num))
            return "La cédula debe tener entre 7 y 10 dígitos";
        } else if (tipo === "CE") {
          if (!/^\d{10,11}$/.test(num))
            return "La cédula de extranjería debe tener 10 u 11 dígitos";
        } else if (tipo === "PPT") {
          if (!/^[A-Za-z0-9]{5,15}$/.test(num))
            return "El PPT debe tener entre 5 y 15 caracteres alfanuméricos";
        } else if (tipo === "Pasaporte") {
          if (!/^[A-Za-z0-9]{5,20}$/.test(num))
            return "El pasaporte debe tener entre 5 y 20 caracteres alfanuméricos";
        }
      }
      return;

    case "phone":
      if (!String(value).trim()) return "El teléfono es obligatorio";
      if (!/^\d{10}$/.test(String(value).trim()))
        return "El teléfono debe tener exactamente 10 dígitos";
      if (
        technicians.some(
          (t) => t.phone.trim() === String(value).trim() && t.id !== currentId
        )
      ) {
        return "Ya existe un técnico con este teléfono";
      }
      return;

    case "email":
      if (!String(value).trim())
        return "El correo electrónico es obligatorio";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim()))
        return "El correo no es válido";
      if (
        technicians.some(
          (t) =>
            t.email.trim().toLowerCase() ===
              String(value).trim().toLowerCase() && t.id !== currentId
        )
      ) {
        return "Ya existe un técnico con este correo";
      }
      return;

    default:
      return;
  }
};

export const validateTechnicianForm = (
  data: Partial<CreateTechnicianData> & { id?: number },
  technicians: Technician[],
  excludeId?: number
): TechnicianErrors => {
  const errors: TechnicianErrors = {};

  const fields: (keyof TechnicianErrors)[] = [
    "name",
    "lastName",
    "password",
    "confirmPassword",
    "documentType",
    "documentNumber",
    "phone",
    "email",
  ];

  fields.forEach((field) => {
    const error = validateTechnicianField(
      field as keyof Omit<CreateTechnicianData, "id" | "image" | "state">,
      (data as any)[field],
      technicians,
      {
        password: data.password,
        documentType: data.documentType,
        id: data.id,
        excludeId,
      }
    );
    if (error) errors[field] = error;
  });

  return errors;
};
