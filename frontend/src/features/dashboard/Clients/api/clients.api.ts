"use client";

import { api } from "@/shared/utils/apiClient";

// ================================
// TYPES FROM BACKEND
// ================================

export type CustomerFromApi = {
  customerid: number;
  customercity: string;
  customerzipcode: string;
  users: {
    userid: number;
    name: string;
    lastname: string;
    email: string;
    documentnumber: string;
    phone: string;
    image?: string | null;
    typeofdocuments?: { id: number; name: string };
    states?: { id: number; name: string };
    roles?: { id: number; name: string };
  };
  sales: [];
};

// ================================
// UI TYPE
// ================================

export type ClientUI = {
  id: number;
  nombre: string;
  apellido: string;
  tipo: string;
  documento: string;
  telefono: string;
  correoElectronico: string;
  estado: string;
  ciudad: string;
  codigoPostal: string;
};

// ================================
// UI MAPPER
// ================================

export const toUiClient = (c: CustomerFromApi): ClientUI => ({
  id: c.customerid,
  nombre: c.users?.name ?? "",
  apellido: c.users?.lastname ?? "",
  tipo: c.users?.typeofdocuments?.name ?? "",
  documento: c.users?.documentnumber ?? "",
  telefono: c.users?.phone ?? "",
  correoElectronico: c.users?.email ?? "",
  estado: c.users?.states?.name ?? "",
  ciudad: c.customercity ?? "",
  codigoPostal: c.customerzipcode ?? "",
});

// ================================
// GET ALL
// ================================

export async function getClients(): Promise<ClientUI[]> {
  const { data } = await api.get<CustomerFromApi[]>("/customers");
  return data.map(toUiClient);
}

// ================================
// CREATE
// ================================

export type CreateClientPayload = {
  name: string;
  lastname: string;
  email: string;
  documentnumber: string;
  phone: string;
  typeid: number;
  stateid?: number;
  image?: string;
  customercity: string;
  customerzipcode: string;
};

export async function createClient(payload: CreateClientPayload) {
  return await api.post("/customers", payload);
}

// ================================
// UPDATE
// ================================

export type UpdateClientPayload = Partial<CreateClientPayload>;

export async function updateClient(
  id: number,
  payload: UpdateClientPayload
) {
  return await api.patch(`/customers/${id}`, payload);
}

// ================================
// DELETE
// ================================

export async function deleteClient(id: number) {
  return await api.delete(`/customers/${id}`);
}