import { Service } from "../types/typesServices";

export const mockServices: Service[] = [
  { 
    id: 1, 
    name: "Mantenimiento preventivo", 
    description: "Revisión periódica de equipos", 
    category: "Mantenimiento Preventivo", 
    image: "/assets/imgs/services/corrective.png",
    state: "Activo" 
  },
  { 
    id: 2, 
    name: "Mantenimiento correctivo", 
    description: "Reparación de fallas o averías", 
    category: "Mantenimiento Correctivo", 
    image: "/assets/imgs/services/corrective.png",
    state: "Activo" 
  },
  { 
    id: 3, 
    name: "Instalación de cámaras", 
    description: "Instalación completa de cámaras de seguridad", 
    category: "Instalación", 
    image: "/assets/imgs/services/installation.png",
    state: "Inactivo" 
  },
  { 
    id: 4, 
    name: "Revisión de servidores", 
    description: "Chequeo y optimización de servidores", 
    category: "TI", 
    image: "/assets/imgs/services/preventive.png",
    state: "Activo" 
  },
  { 
    id: 5, 
    name: "Actualización de software", 
    description: "Actualizar sistemas y aplicaciones", 
    category: "TI", 
    image: "/assets/imgs/services/preventive.png",
    state: "Activo" 
  },
];