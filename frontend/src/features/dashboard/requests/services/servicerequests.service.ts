import { api } from "@/lib/api";
import type { AxiosError } from "axios";

export type StateDTO = {
  stateid: number;
  name: string;
};

export type TechnicianUserDTO = {
  userid?: number;
  id?: number;
  name?: string;
  lastname?: string;
  email?: string;
  documentnumber?: string;
};

export type TechnicianDTO = {
  technicianid?: number;
  technicianId?: number;
  title?: string | null;
  users?: TechnicianUserDTO | null;
};

export type ServiceRequestTechnicianMapDTO = {
  serviceRequestTechniciansId?: number;
  serviceRequestId?: number;
  technicianId?: number;
  technician?: TechnicianDTO | null;
};

export type RequestAvailabilityOptionDTO = {
  date: string;
  startTime: string;
  endTime: string;
};

export type ServiceRequestDTO = {
  serviceRequestId?: number;
  servicerequestid?: number;
  id?: number;
  scheduledAt?: string | null;
  scheduledat?: string | null;
  scheduledEndAt?: string | null;
  scheduledendat?: string | null;
  serviceType?: string;
  servicetype?: string;
  direccion?: string;
  description?: string;
  descriptionPlain?: string;
  createdAt?: string;
  createdat?: string;
  stateId?: number;
  stateid?: number;
  serviceId?: number;
  serviceid?: number;
  clientId?: number;
  clientid?: number;
  state?: { stateid?: number; name?: string } | null;
  service?: { serviceid?: number; name?: string; servicename?: string } | null;
  customer?: any;
  technicians?: TechnicianDTO[];
  assignedTechnicians?: TechnicianDTO[];
  techniciansMap?: ServiceRequestTechnicianMapDTO[];
  serviceRequestTechnicians?: ServiceRequestTechnicianMapDTO[];
  requestTechnicians?: ServiceRequestTechnicianMapDTO[];
  technicianId?: number;
  technicianid?: number;
  clientAvailabilityOptions?: RequestAvailabilityOptionDTO[];
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
  clientId?: number;
  technicians?: number[];
  availabilityOptions?: RequestAvailabilityOptionDTO[];
};

export type UpdateServiceRequestInput = Partial<CreateServiceRequestInput>;
const IN_PROCESS_STATE_ID = 7;

function normalizeStateName(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function resolveCanceledStateId(states: StateDTO[]): number | null {
  const match = states.find((state) => {
    const name = normalizeStateName(state?.name);
    return name.includes("cancel") || name.includes("anul");
  });
  const stateId = Number(match?.stateid);
  return Number.isFinite(stateId) && stateId > 0 ? stateId : null;
}

function getServiceRequestId(row: ServiceRequestDTO): number | null {
  const rawId = row.serviceRequestId ?? row.servicerequestid ?? row.id;
  const idNum = Number(rawId);
  return Number.isFinite(idNum) && idNum > 0 ? idNum : null;
}

function parseRequestStartAt(row: ServiceRequestDTO): Date | null {
  const scheduled = row.scheduledAt ?? row.scheduledat;
  if (!scheduled) return null;
  const parsed = new Date(scheduled);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getRequestStateId(row: ServiceRequestDTO): number {
  const raw = row.stateId ?? row.stateid ?? row.state?.stateid;
  const idNum = Number(raw ?? 0);
  return Number.isFinite(idNum) ? idNum : 0;
}

function isFinalRequestState(row: ServiceRequestDTO): boolean {
  const stateId = getRequestStateId(row);
  if (stateId === 4 || stateId === 6 || stateId === IN_PROCESS_STATE_ID) {
    return true;
  }

  const stateName = String(row.state?.name ?? "").toLowerCase();
  return (
    stateName.includes("cancel") ||
    stateName.includes("anul") ||
    stateName.includes("final") ||
    stateName.includes("complet") ||
    stateName.includes("proceso")
  );
}

function shouldAutoMoveRequestToInProcess(
  row: ServiceRequestDTO,
  now = new Date()
): boolean {
  if (isFinalRequestState(row)) return false;
  const startsAt = parseRequestStartAt(row);
  if (!startsAt) return false;
  return startsAt.getTime() <= now.getTime();
}

function unwrap<T>(payload: any): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as any).data as T;
  }
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

  if (
    data == null ||
    (typeof data === "object" && Object.keys(data).length === 0)
  ) {
    const xhrText = (e.request as any)?.responseText;
    if (typeof xhrText === "string" && xhrText.trim()) {
      return safeJsonParse(xhrText);
    }
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
  const rows = unwrapList<ServiceRequestDTO>(res.data);
  const dueRows = rows.filter((row) => shouldAutoMoveRequestToInProcess(row));
  if (!dueRows.length) return rows;

  const updates = await Promise.allSettled(
    dueRows.map((row) => {
      const id = getServiceRequestId(row);
      if (!id) return Promise.resolve(null);
      return updateServiceRequest(id, { stateId: IN_PROCESS_STATE_ID });
    })
  );

  const updatedById = new Map<number, ServiceRequestDTO>();
  updates.forEach((resUpdate) => {
    if (resUpdate.status !== "fulfilled" || !resUpdate.value) return;
    const updatedId = getServiceRequestId(resUpdate.value);
    if (updatedId) updatedById.set(updatedId, resUpdate.value);
  });

  return rows.map((row) => {
    const id = getServiceRequestId(row);
    return id ? updatedById.get(id) ?? row : row;
  });
}

export async function getServiceRequest(id: number): Promise<ServiceRequestDTO> {
  const res = await api.get<any>(`/service-requests/${id}`);
  const row = unwrap<ServiceRequestDTO>(res.data);
  if (!shouldAutoMoveRequestToInProcess(row)) return row;
  return updateServiceRequest(id, { stateId: IN_PROCESS_STATE_ID });
}

export async function createServiceRequest(
  payload: CreateServiceRequestInput
): Promise<ServiceRequestDTO> {
  const hasValidClientId = Number(payload?.clientId) > 0;
  const hasTechnicians =
    Array.isArray(payload?.technicians) && payload.technicians.length > 0;

  const normalizedAddress = String(payload?.direccion ?? "").trim();
  if (hasTechnicians && !hasValidClientId) {
    throw new Error(
      "Se requiere un cliente valido para crear una solicitud administrativa."
    );
  }

  const endpoint = hasTechnicians
    ? "/service-requests/admin"
    : "/service-requests";
  const normalizedScheduledAt =
    typeof payload?.scheduledAt === "string" && payload.scheduledAt.trim()
      ? payload.scheduledAt
      : undefined;
  const normalizedScheduledEndAt =
    typeof payload?.scheduledEndAt === "string" && payload.scheduledEndAt.trim()
      ? payload.scheduledEndAt
      : undefined;
  const availabilityOptions = Array.isArray(payload?.availabilityOptions)
    ? payload.availabilityOptions
        .map((item) => ({
          date: String(item?.date ?? "").trim(),
          startTime: String(item?.startTime ?? "").trim(),
          endTime: String(item?.endTime ?? "").trim(),
        }))
        .filter((item) => item.date && item.startTime && item.endTime)
    : undefined;

  const body = hasTechnicians
    ? {
        ...(normalizedScheduledAt ? { scheduledAt: normalizedScheduledAt } : {}),
        ...(normalizedScheduledEndAt
          ? { scheduledEndAt: normalizedScheduledEndAt }
          : {}),
        serviceType: payload.serviceType,
        description: payload.description,
        address: normalizedAddress,
        stateId: payload.stateId,
        serviceId: payload.serviceId,
        clientId: hasValidClientId ? Number(payload.clientId) : undefined,
        technicians: payload.technicians ?? [],
        ...(availabilityOptions?.length
          ? { availabilityOptions }
          : {}),
      }
    : {
        ...(normalizedScheduledAt ? { scheduledAt: normalizedScheduledAt } : {}),
        ...(normalizedScheduledEndAt
          ? { scheduledEndAt: normalizedScheduledEndAt }
          : {}),
        serviceType: payload.serviceType,
        description: payload.description,
        address: normalizedAddress,
        stateId: payload.stateId,
        serviceId: payload.serviceId,
        ...(availabilityOptions?.length
          ? { availabilityOptions }
          : {}),
      };

  try {
    const res = await api.post<any>(endpoint, body as any);
    return unwrap<ServiceRequestDTO>(res.data);
  } catch (err) {
    const e = err as AxiosError<any>;
    const bodyErr = await readAxiosErrorBody(e);
    console.error(
      `ERROR POST ${endpoint} ->`,
      e.response?.status,
      bodyErr ?? e.message
    );
    throw err;
  }
}

export async function updateServiceRequest(
  id: number,
  payload: UpdateServiceRequestInput
): Promise<ServiceRequestDTO> {
  const normalizedAddress = String(
    (payload as UpdateServiceRequestInput & { address?: string })?.direccion ??
      (payload as UpdateServiceRequestInput & { address?: string })?.address ??
      "",
  ).trim();

  const {
    direccion: _direccion,
    ...rest
  } = (payload || {}) as UpdateServiceRequestInput & { address?: string };

  const body = {
    ...rest,
    ...(normalizedAddress ? { address: normalizedAddress } : {}),
  };

  const res = await api.patch<any>(`/service-requests/${id}`, body);
  return unwrap<ServiceRequestDTO>(res.data);
}

export async function cancelServiceRequest(id: number): Promise<ServiceRequestDTO> {
  const states = await listStates();
  const canceledStateId = resolveCanceledStateId(states);
  if (!canceledStateId) {
    throw new Error("No se encontro un estado cancelado para solicitudes.");
  }
  return updateServiceRequest(id, { stateId: canceledStateId });
}

export async function deleteServiceRequest(id: number): Promise<void> {
  await api.delete(`/service-requests/${id}`);
}

export async function listStates(): Promise<StateDTO[]> {
  const res = await api.get<any>("/service-requests/states/all");
  return unwrapList<StateDTO>(res.data);
}
