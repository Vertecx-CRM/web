import { api } from "@/lib/api";
import type { AxiosError } from "axios";

export type Option = { id: number; label: string };

function extractList<T>(resOrBody: any): T[] {
  const body = resOrBody?.data ?? resOrBody;

  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.data)) return body.data;
  if (body?.data && Array.isArray(body.data.data)) return body.data.data;

  return [];
}

function getUrlFromResponse(res: any) {
  const responseURL = (res?.request as any)?.responseURL;
  if (responseURL) return responseURL;
  const base = res?.config?.baseURL ?? "";
  const url = res?.config?.url ?? "";
  return `${base}${url}`;
}

function summarizeAxiosError(err: unknown) {
  const e = err as AxiosError<any>;
  return {
    status: e.response?.status,
    data: e.response?.data,
    message: e.message,
  };
}

export async function getCustomerOptions(): Promise<Option[]> {
  const res = await api.get<any>("/customers");
  const list = extractList<any>(res);

  return list
    .map((c) => {
      const id = c.customerid ?? c.id ?? c.customerId;
      const full = [c.users?.name, c.users?.lastname].filter(Boolean).join(" ").trim();
      return { id: Number(id), label: full || `Cliente ${id}` };
    })
    .filter((o) => Number.isFinite(o.id));
}

export async function getServiceOptions(): Promise<Option[]> {
  try {
    const res = await api.get<any>("/services");

    console.log("GET /services URL →", getUrlFromResponse(res));
    console.log("GET /services STATUS →", res.status);
    console.log("GET /services BODY →", res.data);

    const list = extractList<any>(res);
    console.log("GET /services LIST →", list);

    return list
      .map((s) => {
        const id = s.serviceid ?? s.id ?? s.serviceId;
        const name = s.name ?? s.typeofservicename ?? s.serviceType ?? s.title ?? `Servicio ${id}`;
        return { id: Number(id), label: String(name) };
      })
      .filter((o) => Number.isFinite(o.id));
  } catch (err) {
    console.error("GET /services ERROR →", summarizeAxiosError(err));
    throw err;
  }
}
