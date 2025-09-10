// src/features/dashboard/technicians/mocks/mockTechnicians.ts
import { Technician } from "../types/typesTechnicians";

export const mockTechnicians: Technician[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Nombre${i + 1}`,
  lastName: `Apellido${i + 1}`,
  documentType:
    i % 4 === 0
      ? "Cédula de ciudadanía"
      : i % 4 === 1
      ? "Cédula de extranjería"
      : i % 4 === 2
      ? "Tarjeta de identidad"
      : "Pasaporte",
  documentNumber: `${1000000000 + i}`,
  phone: `30012345${String(i).padStart(2, "0")}`,
  email: `tecnico${i + 1}@correo.com`,
  image: undefined, // lo puedes cambiar a una url si usas avatars
  status: i % 2 === 0 ? "Activo" : "Inactivo",
}));
