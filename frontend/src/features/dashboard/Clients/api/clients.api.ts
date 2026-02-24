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
  // si backend devuelve fullName preferirlo
  const rawFull = (c as any).fullName ?? (c as any).full_name ?? null;
  let nombre = normalizeString(c.nombre);
  let apellido = c.apellido ? c.apellido.trim() : "";

  if (rawFull && typeof rawFull === 'string') {
    const parts = rawFull.trim().split(/\s+/);
    nombre = parts.shift() ?? nombre;
    apellido = parts.join(' ');
  } else if (!apellido && nombre.includes(' ')) {
    const parts = nombre.split(/\s+/);
    nombre = parts.shift() ?? nombre;
    apellido = parts.join(' ');
  }

  return {
    id: c.id,

    tipo: normalizeString(c.tipo),
    documento: normalizeString(c.documento),
    nombre,
    apellido,

    telefono: normalizeString(c.telefono),
    correoElectronico: normalizeString(c.correo),

    estado: c.estado ? "Activo" : "Inactivo",
  };
};

// PAYLOADS DE CREACIÓN Y EDICIÓN

export type CreateClientPayload = {
  tipo: string;
  documento: string;
  fullName?: string;
  telefono: string;
  correo: string;
  estado?: boolean; // true/false
};

export type UpdateClientPayload = Partial<CreateClientPayload>;

// CRUD

export const getClients = async (
  status: StatusQuery = "active"
): Promise<Client[]> => {
  const { data } = await api.get<ClientFromApi[]>("/customers", {
    params: { status },
  });
  return data.map(toUiClient);
};

export const getClientById = async (id: number): Promise<Client> => {
  const { data } = await api.get<ClientFromApi>(`/customers/${id}`);
  return toUiClient(data);
};

export const createClient = async (
  payload: CreateClientPayload
): Promise<Client> => {
  const { data } = await api.post(`/customers`, payload);
  return toUiClient(data as ClientFromApi);
};

export const updateClient = async (
  id: number,
  payload: UpdateClientPayload
): Promise<Client> => {
  const { data } = await api.patch(`/customers/${id}`, payload);
  return toUiClient(data as ClientFromApi);
};

export const deleteClient = async (id: number): Promise<unknown> => {
  const { data } = await api.delete(`/customers/${id}`);
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
    `/customers/${id}/deletion-info`
  );

  return {
    canDelete: !!data?.canDelete,
    reason:
      typeof data?.reason === "string" ? data.reason.trim() : undefined,
  };
};
