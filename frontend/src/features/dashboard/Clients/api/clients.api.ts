"use client";

import { api } from "@/shared/utils/apiClient";
import type { Client } from "../types/typeClients";

// TIPOS DEL BACKEND (API)

export type StatusQuery = "active" | "inactive" | "all";

export type ClientFromApi = {
  id: number;

  tipo: string;            // CC, TI, PPT...
  documento: string;
  nombre: string;
  apellido: string | null;

  telefono: string;
  correo: string;

  rol: "Cliente" | "Administrador" | "Empleado";

  estado: boolean;         // true = activo, false = inactivo

  // opcional
  createdAt?: string;
  updatedAt?: string;
};

// NORMALIZACIÓN

const normalizeString = (v: unknown): string => {
  if (typeof v === "string") return v.trim();
  return "";
};

// MAPPER → Transformar API → UI

const toUiClient = (c: ClientFromApi): Client => {
  return {
    id: c.id,

    tipo: normalizeString(c.tipo),
    documento: normalizeString(c.documento),
    nombre: normalizeString(c.nombre),
    apellido: c.apellido ? c.apellido.trim() : "",

    telefono: normalizeString(c.telefono),
    correoElectronico: normalizeString(c.correo),

    rol: c.rol,

    estado: c.estado ? "Activo" : "Inactivo",
  };
};

// PAYLOADS DE CREACIÓN Y EDICIÓN

export type CreateClientPayload = {
  tipo: string;
  documento: string;
  nombre: string;
  apellido?: string | null;

  telefono: string;
  correo: string;

  rol: "Cliente" | "Administrador" | "Empleado";

  estado?: boolean; // true/false
  contrasena: string;
};

export type UpdateClientPayload = Partial<CreateClientPayload>;

// CRUD

export const getClients = async (
  status: StatusQuery = "active"
): Promise<Client[]> => {
  const { data } = await api.get<ClientFromApi[]>("/clients", {
    params: { status },
  });
  return data.map(toUiClient);
};

export const getClientById = async (id: number): Promise<Client> => {
  const { data } = await api.get<ClientFromApi>(`/clients/${id}`);
  return toUiClient(data);
};

export const createClient = async (
  payload: CreateClientPayload
): Promise<unknown> => {
  const { data } = await api.post(`/clients`, payload);
  return data;
};

export const updateClient = async (
  id: number,
  payload: UpdateClientPayload
): Promise<unknown> => {
  const { data } = await api.patch(`/clients/${id}`, payload);
  return data;
};

export const deleteClient = async (id: number): Promise<unknown> => {
  const { data } = await api.delete(`/clients/${id}`);
  return data;
};

// INFORMACIÓN PARA VALIDAR BORRADO

export type ClientDeletionInfo = {
  canDelete: boolean;
  reason?: string;
};

export const getClientDeletionInfo = async (
  id: number
): Promise<ClientDeletionInfo> => {
  const { data } = await api.get<ClientDeletionInfo>(
    `/clients/${id}/deletion-info`
  );

  return {
    canDelete: !!data?.canDelete,
    reason:
      typeof data?.reason === "string" ? data.reason.trim() : undefined,
  };
};
