import { Technician, DOCUMENT_TYPES } from "../types/typesTechnicians";

export const mockTechnicians: Technician[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Nombre${i + 1}`,
  lastName: `Apellido${i + 1}`,
  documentType: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
  documentNumber: `${1000000000 + i}`,
  phone: `30012345${String(i).padStart(2, "0")}`,
  email: `tecnico${i + 1}@correo.com`,
  image: undefined,
  state: i % 2 === 0 ? "Activo" : "Inactivo",
}));
