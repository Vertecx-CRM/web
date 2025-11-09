import { api } from "@/lib/api";

export type StateDTO = {
  stateid: number;
  name: string;
  description?: string | null;
};

export type ServiceRequestDTO = {
  serviceRequestId: number;
  scheduledAt: string | null;
  serviceType: string;
  description: string | null;
  createdAt: string;
  stateId: number;
  serviceId: number;
  clientId: number;
  state?: { stateid: number; name: string; description?: string | null };
  service?: { serviceid: number; name: string; category?: string | null; price?: number | null; image?: string | null };
  customer?: { customerid: number; customercity?: string | null; customerzipcode?: string | null; users?: { userid: number; name?: string | null; lastname?: string | null; email?: string | null } };
};

export type CreateServiceRequestInput = {
  scheduledAt?: string | null;
  serviceType: "MANTENIMIENTO" | "INSTALACION" | string;
  description: string;
  stateId?: number;
  serviceId: number;
  clientId: number;
};

export type UpdateServiceRequestInput = Partial<CreateServiceRequestInput>;

export async function listServiceRequests(): Promise<ServiceRequestDTO[]> {
  const { data } = await api.get<ServiceRequestDTO[]>("/service-requests");
  return data;
}

export async function getServiceRequest(id: number): Promise<ServiceRequestDTO> {
  const { data } = await api.get<ServiceRequestDTO>(`/service-requests/${id}`);
  return data;
}

export async function createServiceRequest(payload: CreateServiceRequestInput): Promise<ServiceRequestDTO> {
  const { data } = await api.post<ServiceRequestDTO>("/service-requests", payload);
  return data;
}

export async function updateServiceRequest(id: number, payload: UpdateServiceRequestInput): Promise<ServiceRequestDTO> {
  const { data } = await api.patch<ServiceRequestDTO>(`/service-requests/${id}`, payload);
  return data;
}

export async function cancelServiceRequest(id: number): Promise<ServiceRequestDTO> {
  return updateServiceRequest(id, { stateId: 4 });
}

export async function deleteServiceRequest(id: number): Promise<void> {
  await api.delete(`/service-requests/${id}`);
}

export async function listStates(): Promise<StateDTO[]> {
  const { data } = await api.get<StateDTO[]>("/service-requests/states/all");
  return data;
}
