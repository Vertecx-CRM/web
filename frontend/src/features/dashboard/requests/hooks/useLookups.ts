// src/features/dashboard/requests/hooks/useLookups.ts
import { useQuery } from "@tanstack/react-query";
import {api} from "@/lib/api";

export type Option = { id: number; label: string };

function normalizeService(it: any): Option | null {
  const id = it?.serviceid ?? it?.id;
  const name = it?.name ?? it?.title ?? "";
  if (!id || !name) return null;
  return { id: Number(id), label: String(name) };
}

function normalizeCustomer(it: any): Option | null {
  const id = it?.customerid ?? it?.id;
  const name = it?.users?.name ?? it?.name ?? "";
  const lastname = it?.users?.lastname ?? it?.lastname ?? "";
  const label = [name, lastname].filter(Boolean).join(" ");
  if (!id || !label) return null;
  return { id: Number(id), label };
}

export function useLookups() {
  const servicesQ = useQuery({
    queryKey: ["lookups", "services"],
    queryFn: async () => {
      const { data } = await api.get("/services");
      const arr = Array.isArray(data) ? data : [];
      return arr.map(normalizeService).filter(Boolean) as Option[];
    },
  });

  const customersQ = useQuery({
    queryKey: ["lookups", "customers"],
    queryFn: async () => {
      const { data } = await api.get("/customers");
      const arr = Array.isArray(data) ? data : [];
      return arr.map(normalizeCustomer).filter(Boolean) as Option[];
    },
  });

  return {
    serviceOptions: servicesQ.data ?? [],
    customerOptions: customersQ.data ?? [],
    isLoading: servicesQ.isLoading || customersQ.isLoading,
  };
}
