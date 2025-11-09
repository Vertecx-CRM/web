import { api } from "@/lib/api";

export type Option = { id: number; label: string };

export async function getCustomerOptions(): Promise<Option[]> {
  const { data } = await api.get<any[]>("/customers");
  const list = Array.isArray(data) ? data : [];
  return list.map((c: any) => {
    const id = c.customerid ?? c.id ?? c.customerId;
    const full = [c.users?.name, c.users?.lastname].filter(Boolean).join(" ").trim();
    return { id: Number(id), label: full || `Cliente ${id}` };
  });
}

export async function getServiceOptions(): Promise<Option[]> {
  const { data } = await api.get<any[]>("/services");
  const list = Array.isArray(data) ? data : [];
  return list.map((s: any) => {
    const id = s.serviceid ?? s.id ?? s.serviceId;
    const name = s.name ?? s.serviceType ?? s.title ?? `Servicio ${id}`;
    return { id: Number(id), label: String(name) };
  });
}
