// mocks/mockClients.ts
import { Client } from "../types/typeClients";

export const initialClients: Client[] = [
  {
    id: 1,
    tipo: "CC",
    documento: "1021086280",
    nombre: "Joao Estid Ortiz Cuello",
    telefono: "3008239274",
    correoElectronico: "joaoestid@gmail.com",
    rol: "Cliente",
    estado: "Inactivo",
  },
  {
    id: 2,
    tipo: "PPT",
    documento: "1221106280",
    nombre: "Samuel Cordoba",
    telefono: "3113369669",
    correoElectronico: "sami69@gmail.com",
    rol: "Cliente",
    estado: "Activo",
  },
  {
    id: 3,
    tipo: "CC",
    documento: "1221302283",
    nombre: "Daniel Alvarez",
    telefono: "3016242087",
    correoElectronico: "negrito88@gmail.com",
    rol: "Cliente",
    estado: "Inactivo",
  }
];
