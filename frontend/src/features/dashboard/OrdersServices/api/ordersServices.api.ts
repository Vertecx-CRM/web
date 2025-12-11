import { api } from "@/lib/api";
import type {
  AddOrderFileDto,
  AddProductToOrderDto,
  AddWorklogDto,
  AssignTechniciansDto,
  CreateOrdersServiceDto,
  FinishOrderDto,
  OrderServiceDTO,
  OrdersServiceHistoryItem,
  RemoveFileDto,
  ReprogramOrderDto,
} from "../types/ordersServices.types";

const BASE = "orders-services";

export async function createOrderService(dto: CreateOrdersServiceDto): Promise<OrderServiceDTO> {
  const payload: CreateOrdersServiceDto = { ...dto, stateid: 5 };
  const { data } = await api.post<OrderServiceDTO>(BASE, payload);
  return data;
}

export async function fetchOrdersServices(): Promise<OrderServiceDTO[]> {
  const { data } = await api.get<OrderServiceDTO[]>(BASE);
  return data;
}

export async function fetchOrderServiceById(id: number): Promise<OrderServiceDTO> {
  const { data } = await api.get<OrderServiceDTO>(`${BASE}/${id}`);
  return data;
}

export async function fetchOrderServiceHistory(
  id: number,
  type?: "SYSTEM" | "TECH" | "NOTE" | "STATUS"
): Promise<OrdersServiceHistoryItem[]> {
  const { data } = await api.get<OrdersServiceHistoryItem[]>(`${BASE}/${id}/history`, {
    params: type ? { type } : undefined,
  });
  return data;
}

export async function addOrderServiceWorklog(id: number, dto: AddWorklogDto): Promise<OrdersServiceHistoryItem> {
  const { data } = await api.post<OrdersServiceHistoryItem>(`${BASE}/${id}/history`, dto);
  return data;
}

export type OrderServicePatch = Partial<OrderServiceDTO> & { stateid?: number };

export async function updateOrderService(id: number, patch: OrderServicePatch): Promise<OrderServiceDTO> {
  const { data } = await api.patch<OrderServiceDTO>(`${BASE}/${id}`, patch);
  return data;
}

export async function cancelOrderService(id: number): Promise<OrderServiceDTO> {
  return updateOrderService(id, { stateid: 4 });
}

export async function deleteOrderService(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}

export async function reprogramOrderService(id: number, dto: ReprogramOrderDto): Promise<OrderServiceDTO> {
  const { data } = await api.patch<OrderServiceDTO>(`${BASE}/${id}/reprogram`, dto);
  return data;
}

export async function finishOrderService(id: number, dto: FinishOrderDto): Promise<OrderServiceDTO> {
  const { data } = await api.patch<OrderServiceDTO>(`${BASE}/${id}/finish`, dto);
  return data;
}

export async function assignTechniciansToOrderService(id: number, dto: AssignTechniciansDto): Promise<OrderServiceDTO> {
  const { data } = await api.patch<OrderServiceDTO>(`${BASE}/${id}/technicians`, dto);
  return data;
}

export async function addProductToOrderService(id: number, dto: AddProductToOrderDto): Promise<OrderServiceDTO> {
  const { data } = await api.post<OrderServiceDTO>(`${BASE}/${id}/products`, dto);
  return data;
}

export async function removeProductFromOrderService(id: number, productid: number): Promise<OrderServiceDTO> {
  const { data } = await api.delete<OrderServiceDTO>(`${BASE}/${id}/products/${productid}`);
  return data;
}

export async function addOrderFile(id: number, dto: AddOrderFileDto): Promise<OrderServiceDTO> {
  const { data } = await api.post<OrderServiceDTO>(`${BASE}/${id}/files`, dto);
  return data;
}

export async function removeOrderFileByIndex(id: number, index: number): Promise<OrderServiceDTO> {
  const { data } = await api.delete<OrderServiceDTO>(`${BASE}/${id}/files/index/${index}`);
  return data;
}

export async function removeOrderFile(id: number, dto: RemoveFileDto): Promise<OrderServiceDTO> {
  const { data } = await api.request<OrderServiceDTO>({
    url: `${BASE}/${id}/files`,
    method: "DELETE",
    data: dto,
  });
  return data;
}

export async function removeOrderFileByUrl(id: number, url: string): Promise<OrderServiceDTO> {
  return removeOrderFile(id, { url });
}

export async function markOrderServiceWarranty(id: number): Promise<OrderServiceDTO> {
  const { data } = await api.patch<OrderServiceDTO>(`${BASE}/${id}/warranty/mark`, {});
  return data;
}

export type ReportWarrantyPayload = {
  label?: string;
  details: string;
  notifiedClient?: boolean;
  reportedByUserId?: number;
};

export async function reportOrderServiceWarranty(id: number, dto: ReportWarrantyPayload): Promise<OrderServiceDTO> {
  const { data } = await api.patch<OrderServiceDTO>(`${BASE}/${id}/warranty/report`, dto);
  return data;
}

export type CreateOrderServiceDto = CreateOrdersServiceDto;
export type UpdateOrderServiceDto = Partial<OrderServiceDTO>;
export type RemoveOrderFileDto = RemoveFileDto;
