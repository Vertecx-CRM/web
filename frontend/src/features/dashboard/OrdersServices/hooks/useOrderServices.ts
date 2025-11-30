import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const orderServiceKeys = {
  all: ['ordersServices'] as const,
  list: () => [...orderServiceKeys.all, 'list'] as const,
  detail: (id: number) => [...orderServiceKeys.all, 'detail', id] as const,
};

export interface OrderServiceDTO {
  ordersservicesid: number;
  description: string;
  total: number;
  client?: {
    customerid: number;
    userid: number;
    customercity?: string | null;
    users?: {
      userid?: number;
      name?: string | null;
      lastname?: string | null;
    };
  };
  state?: {
    stateid: number;
    name: string;
  };
  fechainicio: string;
  fechafin: string;
  horainicio: string;
  horafin: string;
  technicians?: Array<{
    technicianid: number;
    users?: {
      name?: string | null;
      lastname?: string | null;
    };
  }>;
  products?: Array<{
    ordersservicesproductsid: number;
    cantidad: number;
    product?: {
      productid: number;
      productname: string;
    };
  }>;
}

export interface UpdateOrderServicePayload {
  fechainicio: string;
  fechafin: string;
  horainicio: string;
  horafin: string;
}

export async function listOrderServices(): Promise<OrderServiceDTO[]> {
  const res = await api.get('/orders-services');
  return Array.isArray(res.data) ? res.data : [];
}

export async function patchOrderService(id: number, payload: UpdateOrderServicePayload) {
  const res = await api.patch(`/orders-services/${id}`, payload);
  return res.data;
}

export function useOrderServices() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: orderServiceKeys.list(),
    queryFn: listOrderServices,
  });

  const updateOrderService = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateOrderServicePayload }) =>
      patchOrderService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderServiceKeys.list() });
    },
  });

  return { ...query, updateOrderService };
}
