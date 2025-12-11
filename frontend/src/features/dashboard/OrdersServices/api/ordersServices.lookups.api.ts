"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

type LookupsResponse = {
  customers?: any;
  clients?: any;
  technicians?: any;
  products?: any;
  services?: any;
  serviceTypes?: any;
  tiposServicio?: any;
  types?: any;
  pendingStateId?: number | null;
  pendingState?: any;
};

async function tryGet<T = any>(paths: string[]) {
  let lastErr: any = null;
  for (const p of paths) {
    try {
      const res = await api.get<T>(p);
      return res;
    } catch (e: any) {
      lastErr = e;
    }
  }
  throw lastErr;
}

function pickErrorMessage(e: any) {
  return e?.response?.data?.message || e?.message || "Error cargando datos.";
}

function isNumericStringExpectedError(e: any) {
  const msg = String(pickErrorMessage(e)).toLowerCase();
  return msg.includes("numeric string is expected");
}

function normalizeKey(v: any) {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function unwrapList(x: any): any[] {
  if (Array.isArray(x)) return x;
  if (x && typeof x === "object") {
    if (Array.isArray((x as any).data)) return (x as any).data;
    if (Array.isArray((x as any).items)) return (x as any).items;
    if (Array.isArray((x as any).results)) return (x as any).results;
    if (Array.isArray((x as any).rows)) return (x as any).rows;
  }
  return [];
}

function findPendingStateId(statesLike: any) {
  const states = unwrapList(statesLike);
  const pending = states.find((s: any) => {
    const name = normalizeKey(s?.name ?? s?.state ?? s?.label ?? "");
    return name === "pendiente" || name.includes("pendiente");
  });
  const id = pending?.stateid ?? pending?.id;
  return typeof id === "number" ? id : null;
}

export function useOrdersServicesLookups() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [pendingStateId, setPendingStateId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const fallback = async () => {
      const [cRes, tRes, pRes, sRes, typesRes] = await Promise.all([
        tryGet<any>(["api/customers", "/api/customers", "customers", "/customers"]),
        tryGet<any>(["api/technicians", "/api/technicians", "technicians", "/technicians"]),
        tryGet<any>(["api/products", "/api/products", "products", "/products"]),
        tryGet<any>([
          "api/services",
          "/api/services",
          "services",
          "/services",
          "api/servicios",
          "/api/servicios",
          "servicios",
          "/servicios",
        ]),
        tryGet<any>([
          "services/types",
          "/services/types",
          "api/services/types",
          "/api/services/types",
          "api/services-types",
          "/api/services-types",
          "services-types",
          "/services-types",
          "api/service-types",
          "/api/service-types",
          "service-types",
          "/service-types",
        ]),
      ]);

      let pending: number | null = null;
      try {
        const statesRes = await tryGet<any>(["api/states", "/api/states", "states", "/states"]);
        pending = findPendingStateId(statesRes.data);
      } catch {
        pending = null;
      }

      setCustomers(unwrapList(cRes.data));
      setTechnicians(unwrapList(tRes.data));
      setProducts(unwrapList(pRes.data));
      setServices(unwrapList(sRes.data));
      setServiceTypes(unwrapList(typesRes.data));
      setPendingStateId(pending);
      setError(null);
    };

    try {
      const res = await tryGet<LookupsResponse>([
        "api/orders-services/lookups",
        "/api/orders-services/lookups",
        "orders-services/lookups",
        "/orders-services/lookups",
      ]);

      const data: LookupsResponse = (res as any)?.data ?? {};

      const cs = data.customers ?? data.clients ?? [];
      const ts = data.technicians ?? [];
      const ps = data.products ?? [];
      const sv = data.services ?? [];
      const typesRaw = data.serviceTypes ?? data.tiposServicio ?? data.types ?? [];

      let pending: number | null = null;
      if (typeof data.pendingStateId === "number") pending = data.pendingStateId;
      else if (typeof data.pendingState?.stateid === "number") pending = data.pendingState.stateid;
      else if (typeof data.pendingState?.id === "number") pending = data.pendingState.id;

      setCustomers(unwrapList(cs));
      setTechnicians(unwrapList(ts));
      setProducts(unwrapList(ps));
      setServices(unwrapList(sv));

      if (unwrapList(typesRaw).length) {
        setServiceTypes(unwrapList(typesRaw));
      } else {
        try {
          const tr = await tryGet<any>([
            "services/types",
            "/services/types",
            "api/services/types",
            "/api/services/types",
          ]);
          setServiceTypes(unwrapList(tr.data));
        } catch {
          setServiceTypes([]);
        }
      }

      setPendingStateId(pending ?? null);
      setError(null);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404 || isNumericStringExpectedError(e) || status === 400) {
        try {
          await fallback();
        } catch (e2: any) {
          setError(String(pickErrorMessage(e2)));
          setCustomers([]);
          setTechnicians([]);
          setProducts([]);
          setServices([]);
          setServiceTypes([]);
          setPendingStateId(null);
        }
      } else {
        setError(String(pickErrorMessage(e)));
        setCustomers([]);
        setTechnicians([]);
        setProducts([]);
        setServices([]);
        setServiceTypes([]);
        setPendingStateId(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, error, customers, technicians, products, services, serviceTypes, pendingStateId, refresh };
}
