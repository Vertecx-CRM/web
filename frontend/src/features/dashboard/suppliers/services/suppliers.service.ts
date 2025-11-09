import { api } from '@/lib/api';

export type SupplierDTO = {
  supplierid: number;
  name: string;
  nit: string;
  phone: string;
  email: string;
  address: string;
  servicetype: string;
  stateid: number;
  contactname: string;
  image: string;
  rating: number;
  createat: string;
  updateat: string;
};

export type CreateSupplierInput = {
  name: string;
  nit: string;
  phone: string;
  email: string;
  address: string;
  stateid: number;
  contactname: string;
  image: string;
  rating: number;
};

export type UpdateSupplierInput = Partial<CreateSupplierInput>;

type ListEnvelope<T> = { message?: string; data: T };
type MaybeEnvelope<T> = T | ListEnvelope<T>;

function unwrap<T>(payload: MaybeEnvelope<T>): T {
  return (payload as ListEnvelope<T>)?.data ?? (payload as T);
}

function prettyError(err: any): never {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Solicitud inválida';
  const details = err?.response?.data?.details || err?.response?.data?.errors;
  const full = details ? `${msg} - ${JSON.stringify(details)}` : msg;
  throw new Error(full);
}

export const listSuppliers = async () => {
  try {
    const res = await api.get<MaybeEnvelope<SupplierDTO[]>>('/suppliers');
    return unwrap(res.data);
  } catch (err) {
    prettyError(err);
  }
};

export const getSupplier = async (id: number) => {
  try {
    const res = await api.get<MaybeEnvelope<SupplierDTO>>(`/suppliers/${id}`);
    return unwrap(res.data);
  } catch (err) {
    prettyError(err);
  }
};

export const createSupplier = async (dto: CreateSupplierInput) => {
  try {
    const res = await api.post<MaybeEnvelope<SupplierDTO>>('/suppliers', dto);
    return unwrap(res.data);
  } catch (err) {
    prettyError(err);
  }
};

export const updateSupplier = async (id: number, dto: UpdateSupplierInput) => {
  try {
    const res = await api.patch<MaybeEnvelope<SupplierDTO>>(`/suppliers/${id}`, dto);
    return unwrap(res.data);
  } catch (err) {
    prettyError(err);
  }
};

export const deleteSupplier = async (id: number) => {
  try {
    const res = await api.delete<MaybeEnvelope<{ message: string }>>(`/suppliers/${id}`);
    return unwrap(res.data);
  } catch (err) {
    prettyError(err);
  }
};
