"use client";

import { api } from "@/shared/utils/apiClient";

//   TYPES

export interface PurchaseOrderFromApi {
  id: number;
  numeroOrden: string;
  proveedor: string;
  precioUnitario: number | string;
  fecha: string;

  estado: string;
  descripcion?: string | null;
  cantidad: number;

  subtotal: number | string;
  iva: number | string;
  total: number | string;

  motivoAnulacion?: string | null;
  fechaAnulacion?: string | null;
  usuarioAnulacion?: string | null;

  productos?: any[] | null;
}

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplier: string;

  unitPrice: number;
  date: string;
  state: string;

  description: string | null;
  quantity: number;

  subtotal: number;
  iva: number;
  total: number;

  cancelReason?: string | null;
  cancelDate?: string | null;
  cancelUser?: string | null;

  products: any[];
}

// utils

const toNumber = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toUi = (p: PurchaseOrderFromApi): PurchaseOrder => ({
  id: p.id,
  orderNumber: p.numeroOrden,
  supplier: p.proveedor,

  unitPrice: toNumber(p.precioUnitario),
  date: p.fecha,
  state: p.estado,

  description: p.descripcion ?? null,
  quantity: p.cantidad,

  subtotal: toNumber(p.subtotal),
  iva: toNumber(p.iva),
  total: toNumber(p.total),

  cancelReason: p.motivoAnulacion ?? null,
  cancelDate: p.fechaAnulacion ?? null,
  cancelUser: p.usuarioAnulacion ?? null,

  products: p.productos ?? [],
});

// API METHODS

const BASE = "/purchase-orders";

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  const { data } = await api.get<PurchaseOrderFromApi[]>(BASE);
  return data.map(toUi);
};

export const getPurchaseOrderById = async (
  id: number
): Promise<PurchaseOrder> => {
  const { data } = await api.get<PurchaseOrderFromApi>(`${BASE}/${id}`);
  return toUi(data);
};

export const createPurchaseOrder = async (
  payload: any
): Promise<PurchaseOrder> => {
  const { data } = await api.post<PurchaseOrderFromApi>(BASE, payload);
  return toUi(data);
};

export const updatePurchaseOrder = async (
  id: number,
  payload: any
): Promise<PurchaseOrder> => {
  const { data } = await api.patch<PurchaseOrderFromApi>(`${BASE}/${id}`, payload);
  return toUi(data);
};

export const deletePurchaseOrder = async (id: number): Promise<boolean> => {
  await api.delete(`${BASE}/${id}`);
  return true;
};

export const cancelPurchaseOrder = async (
  id: number,
  reason: string,
  user: string
): Promise<PurchaseOrder> => {
  const body = {
    estado: "Anulada",
    motivoAnulacion: reason,
    fechaAnulacion: new Date().toISOString(),
    usuarioAnulacion: user,
  };

  const { data } = await api.patch<PurchaseOrderFromApi>(
    `${BASE}/${id}/cancel`,
    body
  );

  return toUi(data);
};
