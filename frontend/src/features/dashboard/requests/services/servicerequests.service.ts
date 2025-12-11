import { api } from "@/lib/api";
import type { AxiosError } from "axios";

export type StateDTO = {
  stateid: number;
  name: string;
  description?: string | null;
};

type TechnicianDTO = {
  technicianid?: number;
  technicianId?: number;
  id?: number;
  title?: string | null;
  users?: { name?: string | null; lastname?: string | null; roles?: { name?: string | null } | null } | null;
  technician?: {
    technicianid?: number;
    technicianId?: number;
    users?: { name?: string | null; lastname?: string | null; roles?: { name?: string | null } | null } | null;
    title?: string | null;
  } | null;
};

export type ServiceRequestDTO = {
  serviceRequestId: number;
  scheduledAt: string | null;
  scheduledEndAt: string | null;
  serviceType: string;
  description: string | null;
  direccion: string | null;
  createdAt: string;
  stateId: number;
  serviceId: number;
  clientId: number;
  state?: { stateid: number; name: string; description?: string | null };
  service?: {
    serviceid: number;
    name: string;
    category?: string | null;
    price?: number | null;
    image?: string | null;
  };
  customer?: {
    customerid: number;
    customercity?: string | null;
    customerzipcode?: string | null;
    users?: { userid: number; name?: string | null; lastname?: string | null; email?: string | null };
  };
  technicians?: TechnicianDTO[];
  serviceRequestTechnicians?: TechnicianDTO[];
  requestTechnicians?: TechnicianDTO[];
  assignedTechnicians?: TechnicianDTO[];
  technicianId?: number;
  technicianid?: number;
};

export type ServiceTypeApi = "MANTENIMIENTO" | "INSTALACION";

export type CreateServiceRequestInput = {
  scheduledAt?: string | null;
  scheduledEndAt?: string | null;
  serviceType: ServiceTypeApi;
  description: string;
  direccion: string;
  stateId: number;
  serviceId: number;
  clientId: number;
};

export type UpdateServiceRequestInput = Partial<CreateServiceRequestInput>;

function unwrap<T>(payload: any): T {
  if (payload && typeof payload === "object" && "data" in payload) return (payload as any).data as T;
  return payload as T;
}

function unwrapList<T>(payload: any): T[] {
  const data = unwrap<any>(payload);
  return Array.isArray(data) ? (data as T[]) : [];
}

function safeJsonParse(input: string) {
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

async function readAxiosErrorBody(e: AxiosError<any>) {
  const data = e.response?.data;

  if (data == null || (typeof data === "object" && Object.keys(data).length === 0)) {
    const xhrText = (e.request as any)?.responseText;
    if (typeof xhrText === "string" && xhrText.trim()) return safeJsonParse(xhrText);
    return data;
  }

  if (typeof data === "string") return safeJsonParse(data);

  if (typeof Blob !== "undefined" && data instanceof Blob) {
    const text = await data.text();
    return safeJsonParse(text);
  }

  return data;
}

export async function listServiceRequests(): Promise<ServiceRequestDTO[]> {
  const res = await api.get<any>("/service-requests");
  return unwrapList<ServiceRequestDTO>(res.data);
}

export async function getServiceRequest(id: number): Promise<ServiceRequestDTO> {
  const res = await api.get<any>(`/service-requests/${id}`);
  return unwrap<ServiceRequestDTO>(res.data);
}

export async function createServiceRequest(payload: CreateServiceRequestInput): Promise<ServiceRequestDTO> {
  console.log("PAYLOAD ENVIADO →", payload);

  try {
    const res = await api.post<any>("/service-requests", payload);
    return unwrap<ServiceRequestDTO>(res.data);
  } catch (err) {
    const e = err as AxiosError<any>;
    const body = await readAxiosErrorBody(e);
    console.error("ERROR POST /service-requests →", e.response?.status, body ?? e.message);
    throw err;
  }
}

export async function updateServiceRequest(
  id: number,
  payload: UpdateServiceRequestInput
): Promise<ServiceRequestDTO> {
  const res = await api.patch<any>(`/service-requests/${id}`, payload);
  return unwrap<ServiceRequestDTO>(res.data);
}

export async function cancelServiceRequest(id: number): Promise<ServiceRequestDTO> {
  return updateServiceRequest(id, { stateId: 4 });
}

export async function deleteServiceRequest(id: number): Promise<void> {
  await api.delete(`/service-requests/${id}`);
}

export async function listStates(): Promise<StateDTO[]> {
  const res = await api.get<any>("/service-requests/states/all");
  return unwrapList<StateDTO>(res.data);
}
