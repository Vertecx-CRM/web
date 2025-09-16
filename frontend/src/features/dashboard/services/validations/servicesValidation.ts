// servicesValidations.ts
import { Service } from "@/features/dashboard/services/types/typesServices";

export interface ServiceErrors {
  name?: string;
  description?: string;
  category?: string;
  image?: string;
}

export const validateServiceField = (
  field: keyof Omit<Service, "id" | "state">,
  value: any,
  services: Service[],
  currentId?: number
): string | undefined => {
  switch (field) {
    case "name":
      if (!String(value).trim()) return "El nombre es obligatorio";
      if (
        services.some(
          (s) =>
            s.name.toLowerCase() === String(value).trim().toLowerCase() &&
            s.id !== currentId
        )
      ) {
        return "Ya existe un servicio con este nombre";
      }
      return;

    case "category":
      if (!value) return "La categoría es obligatoria";
      return;

    case "image":
      if (!value) return "Debe seleccionar una imagen";
      return;

    case "description":
      // descripción NO lleva validación
      return;

    default:
      return;
  }
};

export const validateServiceForm = (
  data: Omit<Service, "id" | "state">,
  services: Service[],
  currentId?: number
): ServiceErrors => {
  const errors: ServiceErrors = {};

  const fields: (keyof Omit<Service, "id" | "state">)[] = [
    "name",
    "description",
    "category",
    "image",
  ];

  fields.forEach((field) => {
    const error = validateServiceField(
      field,
      (data as any)[field],
      services,
      currentId
    );
    if (error) errors[field] = error;
  });

  return errors;
};
