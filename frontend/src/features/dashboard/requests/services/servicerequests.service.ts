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

export type CreateServiceRequestInput = {
  scheduledAt?: string | null;
  serviceType: "MANTENIMIENTO" | "INSTALACION" | string;
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

function coerceId(v: any): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.trim());
    return Number.isFinite(n) ? n : 0;
  }
  if (v && typeof v === "object") {
    if ("id" in v) return coerceId((v as any).id);
    if ("value" in v) return coerceId((v as any).value);
  }
  return 0;
}

function normalizeServiceType(v: any): "MANTENIMIENTO" | "INSTALACION" | string {
  const s = String(v ?? "").trim();
  if (!s) return s;

  const up = s.toUpperCase();
  if (up === "MANTENIMIENTO" || up === "INSTALACION") return up;

  const low = s.toLowerCase();
  if (low === "mantenimiento") return "MANTENIMIENTO";
  if (low === "instalacion" || low === "instalación") return "INSTALACION";

  return s;
}

function normalizeDateString(v: any): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2]}-${m1[1]}`;
  return s;
}

function normalizeTimeString(v: any): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const hh = String(m[1]).padStart(2, "0");
  const mm = String(m[2]).padStart(2, "0");
  return `${hh}:${mm}`;
}

function buildScheduledAt(date: string, time: string) {
  const [y, m, d] = date.split("-").map((n) => Number(n));
  const [hh, mm] = time.split(":").map((n) => Number(n));
  const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
  return dt.toISOString();
}

function normalizeCreatePayload(payload: any): CreateServiceRequestInput {
  const direccion = String(payload?.direccion ?? payload?.address ?? "").trim().slice(0, 255);
  const description = String(payload?.description ?? payload?.descripcion ?? "").trim();

  const serviceId = coerceId(payload?.serviceId ?? payload?.servicio);
  const clientId = coerceId(payload?.clientId ?? payload?.cliente);

  const typeFrom =
    payload?.serviceType ??
    payload?.tipo ??
    (Array.isArray(payload?.tipos) ? payload.tipos[0] : undefined);

  const serviceType = normalizeServiceType(typeFrom);
  const stateId = coerceId(payload?.stateId ?? 1) || 1;

  let scheduledAt: string | null = payload?.scheduledAt ?? null;

  if (!scheduledAt) {
    const date = normalizeDateString(payload?.programada);
    const time = normalizeTimeString(payload?.horaProgramada) ?? "09:00";
    if (date) scheduledAt = buildScheduledAt(date, time);
  }

  return {
    serviceType,
    serviceId,
    clientId,
    direccion,
    description,
    scheduledAt,
    stateId,
  };
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

export async function createServiceRequest(payload: any): Promise<ServiceRequestDTO> {
  const clean = normalizeCreatePayload(payload);

  console.log("PAYLOAD ENVIADO →", clean);

  try {
    const res = await api.post<any>("/service-requests", clean);
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
