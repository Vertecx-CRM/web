"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import RequireAuth from "@/features/auth/requireauth";
import { createOrderService } from "../api/ordersServices.api";
import type { CreateOrdersServiceDto } from "../types/ordersServices.types";
import { uploadImageToCloudinary } from "@/shared/utils/cloudinary";
import { useOrdersServicesLookups } from "../hooks/useOrdersServicesLookups";
import { showError, showWarning } from "@/shared/utils/notifications";
import { api } from "@/lib/api";

type ServiceLineItem = { id: string; nombre: string; precio: number; tipoId: number };
type MaterialLineItem = { id: string; nombre: string; precio: number; cantidad: number };

type CustomerOption = {
  customerid: number;
  label: string;
  city?: string | null;
  zipcode?: string | null;
  phone?: string | null;
  email?: string | null;
};

type TechnicianOption = {
  technicianid: number;
  label: string;
};

type ProductOption = {
  productid: number;
  productname: string;
  productpriceofsale: number;
};

type ServiceTypeOption = {
  typeofserviceid: number;
  name: string;
  label: string;
};

type ServiceOption = {
  serviceid: number;
  name: string;
  typeofserviceid: number;
  typeofservicename?: string | null;
  stateid?: number | null;
  statename?: string | null;
};

const IVA_PCT = 19;

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function formatCOP(n?: number) {
  return n == null
    ? "—"
    : n.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      });
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toLocalYMD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toLocalHM(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function titleCase(s: string) {
  const x = String(s ?? "").trim();
  if (!x) return "";
  return x.charAt(0).toUpperCase() + x.slice(1);
}

type Errors = Partial<{
  quote: string;
  clientId: string;
  tipo: string;
  schedule: string;
  technicians: string;
  viaticos: string;
  servicios: string;
  materiales: string;
}>;

type Touched = Partial<Record<keyof Errors, boolean>>;

function useDesktopQuery() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const fn = () => setIsDesktop(mq.matches);
    fn();
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);
  return isDesktop;
}

function useSidebarWidth(selector = "#app-sidebar") {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;
    const update = () => setW(el.offsetWidth || 0);
    update();
    let ro: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(() => update());
      ro.observe(el);
    }
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ["class", "style"] });
    window.addEventListener("resize", update);
    return () => {
      if (ro) {
        try {
          ro.disconnect();
        } catch {}
        ro = null;
      }
      mo.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [selector]);
  return w;
}

function initials(name: string) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase() || "T";
}

function normalizeText(v: string) {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parseYMD(ymd: string) {
  const [y, m, d] = (ymd || "").split("-").map((x) => Number(x));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function timeToMinutes(hm: string) {
  const [h, m] = (hm || "").split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
  return h * 60 + m;
}

function minutesToTime(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

const SCHEDULE_MIN = 7 * 60;
const SCHEDULE_MAX = 17 * 60;

function isAllowedDate(ymd: string) {
  const d = parseYMD(ymd);
  if (!d) return false;
  const day = d.getDay();
  return day >= 1 && day <= 6;
}

function isAllowedTime(hm: string) {
  const mins = timeToMinutes(hm);
  if (!Number.isFinite(mins)) return false;
  return mins >= SCHEDULE_MIN && mins <= SCHEDULE_MAX;
}

type QuoteLike = any;

type QuoteNormalized = {
  quotesid?: number;
  clientid?: number;
  typeofserviceid?: number | null;
  fechainicio?: string;
  fechafin?: string;
  horainicio?: string;
  horafin?: string;
  viaticos?: number;
  technicians?: number[];
  description?: string;
  services?: Array<{ serviceid: number; cantidad: number; unitprice: number }>;
  products?: Array<{ productid: number; cantidad: number; unitprice?: number }>;
};

function asNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function pickNumber(...vals: any[]) {
  for (const v of vals) {
    const n = asNumber(v);
    if (n != null) return n;
  }
  return undefined;
}

function pickString(...vals: any[]) {
  for (const v of vals) {
    const s = typeof v === "string" ? v : v == null ? "" : String(v);
    const t = s.trim();
    if (t) return t;
  }
  return "";
}

function toNumArray(v: any): number[] {
  if (Array.isArray(v)) return v.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0);
  if (typeof v === "string") {
    return v
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
  }
  return [];
}

function decodeBase64Url(input: string) {
  const base = String(input || "").replace(/-/g, "+").replace(/_/g, "/");
  const pad = base.length % 4 === 0 ? "" : "=".repeat(4 - (base.length % 4));
  return atob(base + pad);
}

function parseQuoteParam(raw: string): any | null {
  const v = String(raw || "").trim();
  if (!v) return null;
  try {
    if (v.startsWith("{") || v.startsWith("[")) return JSON.parse(v);
  } catch {}
  try {
    const json = decodeBase64Url(v);
    return JSON.parse(json);
  } catch {}
  return null;
}

function extractFreeTextFromDescription(desc: string) {
  const s = String(desc || "").trim();
  if (!s) return "";
  const hasStructured =
    /\bTipo:\s*/i.test(s) ||
    /\bServicios:\s*/i.test(s) ||
    /\bProductos:\s*/i.test(s) ||
    /\bDescripción:\s*/i.test(s);
  if (!hasStructured) return s;
  const m = s.match(/Descripción:\s*([\s\S]*)$/i);
  if (m && m[1]) return String(m[1]).trim();
  return "";
}

function coerceAllowedDateOrNext(ymd: string) {
  if (isAllowedDate(ymd)) return ymd;
  const d = parseYMD(ymd);
  if (!d) return toLocalYMD(new Date());
  for (let i = 0; i < 10; i++) {
    d.setDate(d.getDate() + 1);
    const next = toLocalYMD(d);
    if (isAllowedDate(next)) return next;
  }
  return toLocalYMD(new Date());
}

function coerceAllowedTime(hm: string, fallback: string) {
  if (isAllowedTime(hm)) return hm;
  return fallback;
}

function normalizeQuote(q: QuoteLike): QuoteNormalized {
  const root = q?.quote ?? q?.quotation ?? q?.cotizacion ?? q;

  const quotesid = pickNumber(root?.quotesid, root?.quotationid, root?.cotizacionid, root?.id);

  const clientid = pickNumber(
    root?.clientid,
    root?.customerid,
    root?.client?.clientid,
    root?.customer?.customerid,
    root?.client?.id,
    root?.customer?.id
  );

  const techs = toNumArray(root?.technicians ?? root?.technicianids ?? root?.techs ?? root?.assignedTechnicians);

  const fechainicio = pickString(root?.fechainicio, root?.dateStart, root?.startdate, root?.startDate);
  const fechafin = pickString(root?.fechafin, root?.dateEnd, root?.enddate, root?.endDate);
  const horainicio = pickString(root?.horainicio, root?.timeStart, root?.starttime, root?.startTime);
  const horafin = pickString(root?.horafin, root?.timeEnd, root?.endtime, root?.endTime);

  const viaticos = pickNumber(root?.viaticos, root?.travelExpenses, root?.travel, root?.transport) ?? 0;

  const description = pickString(root?.description, root?.notes, root?.observations);

  const rawServices =
    root?.services ??
    root?.quotedservices ??
    root?.servicesitems ??
    root?.details?.services ??
    root?.detail?.services ??
    root?.quoteDetails?.services ??
    [];
  const servicesArr = Array.isArray(rawServices) ? rawServices : [];

  const rawProducts =
    root?.products ??
    root?.materials ??
    root?.items ??
    root?.quotedproducts ??
    root?.productsitems ??
    root?.details?.products ??
    root?.quoteDetails?.products ??
    [];
  const productsArr = Array.isArray(rawProducts) ? rawProducts : [];

  const typeofserviceid =
    pickNumber(
      root?.typeofserviceid,
      root?.typeOfServiceId,
      root?.servicetypeid,
      root?.serviceTypeId,
      servicesArr?.[0]?.typeofserviceid,
      servicesArr?.[0]?.typeOfServiceId,
      servicesArr?.[0]?.service?.typeofserviceid,
      servicesArr?.[0]?.service?.typeOfServiceId
    ) ?? null;

  const services = servicesArr
    .map((s: any) => {
      const serviceid = pickNumber(s?.serviceid, s?.id, s?.service?.serviceid, s?.service?.id);
      const cantidad = pickNumber(s?.cantidad, s?.quantity, s?.qty) ?? 1;
      const unitprice = pickNumber(s?.unitprice, s?.price, s?.unitPrice, s?.valor) ?? 0;
      if (!serviceid) return null;
      return {
        serviceid,
        cantidad: Math.max(1, Math.round(cantidad)),
        unitprice: Math.max(0, Math.round(unitprice)),
      };
    })
    .filter(Boolean) as Array<{ serviceid: number; cantidad: number; unitprice: number }>;

  const products = productsArr
    .map((p: any) => {
      const productid = pickNumber(p?.productid, p?.id, p?.product?.productid, p?.product?.id);
      const cantidad = pickNumber(p?.cantidad, p?.quantity, p?.qty) ?? 1;
      const unitprice = pickNumber(p?.unitprice, p?.price, p?.unitPrice, p?.valor);
      if (!productid) return null;
      return {
        productid,
        cantidad: Math.max(1, Math.round(cantidad)),
        unitprice: unitprice == null ? undefined : Math.max(0, Math.round(unitprice)),
      };
    })
    .filter(Boolean) as Array<{ productid: number; cantidad: number; unitprice?: number }>;

  return {
    quotesid,
    clientid,
    typeofserviceid,
    fechainicio,
    fechafin,
    horainicio,
    horafin,
    viaticos,
    technicians: techs,
    description,
    services,
    products,
  };
}

export default function OrderCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const returnTo = searchParams.get("returnTo") || "/dashboard/orders-services";

  const quotesIdParam =
    searchParams.get("quotesId") ||
    searchParams.get("quotationId") ||
    searchParams.get("cotizacionId") ||
    searchParams.get("cotizacionid") ||
    searchParams.get("quotesid");

  const quoteDataParam =
    searchParams.get("quoteData") ||
    searchParams.get("quoteJson") ||
    searchParams.get("cotizacion") ||
    searchParams.get("quotation");

  const quotesIdFromUrl = (() => {
    const n = Number(quotesIdParam);
    return Number.isFinite(n) && n > 0 ? n : null;
  })();

  const {
    loading: lookupsLoading,
    error: lookupsError,
    customers: customersRaw,
    technicians: techniciansRaw,
    products: productsRaw,
    services: servicesRaw,
    serviceTypes: serviceTypesRaw,
    pendingStateId,
  } = useOrdersServicesLookups();

  const customers = useMemo<CustomerOption[]>(() => {
    return (customersRaw || [])
      .map((c: any) => {
        const u = c?.users || c?.user || c?.Users || {};
        const name = [u?.name, u?.lastname].filter(Boolean).join(" ").trim();
        const label = name || `Cliente #${c?.customerid ?? c?.clientid ?? c?.id ?? "?"}`;
        return {
          customerid: Number(c?.customerid ?? c?.clientid ?? c?.id),
          label,
          city: c?.customercity ?? c?.city ?? null,
          zipcode: c?.customerzipcode ?? c?.zipcode ?? null,
          phone: u?.phone ?? c?.phone ?? null,
          email: u?.email ?? c?.email ?? null,
        } as CustomerOption;
      })
      .filter((x) => Number.isFinite(x.customerid) && x.customerid > 0);
  }, [customersRaw]);

  const technicians = useMemo<TechnicianOption[]>(() => {
    return (techniciansRaw || [])
      .map((t: any) => {
        const u = t?.users || t?.user || t?.Users || {};
        const name = [u?.name, u?.lastname].filter(Boolean).join(" ").trim();
        const label = name || `Técnico #${t?.technicianid ?? t?.id ?? "?"}`;
        return { technicianid: Number(t?.technicianid ?? t?.id), label } as TechnicianOption;
      })
      .filter((x) => Number.isFinite(x.technicianid) && x.technicianid > 0);
  }, [techniciansRaw]);

  const productsCatalog = useMemo<ProductOption[]>(() => {
    return (productsRaw || [])
      .map((p: any) => {
        const productid = Number(p?.productid ?? p?.id);
        const productname = (p?.productname ?? p?.name ?? `Producto #${productid}`).toString();
        const productpriceofsale = Number(p?.productpriceofsale ?? p?.priceofsale ?? p?.price ?? 0);
        return { productid, productname, productpriceofsale } as ProductOption;
      })
      .filter((x) => Number.isFinite(x.productid) && x.productid > 0);
  }, [productsRaw]);

  const serviceTypes = useMemo<ServiceTypeOption[]>(() => {
    return (serviceTypesRaw || [])
      .map((t: any) => {
        const id = Number(t?.typeofserviceid ?? t?.id);
        const name = String(t?.name ?? t?.typeofservicename ?? t?.label ?? "").trim();
        return { typeofserviceid: id, name, label: titleCase(name) || `Tipo #${id}` } as ServiceTypeOption;
      })
      .filter((x) => Number.isFinite(x.typeofserviceid) && x.typeofserviceid > 0);
  }, [serviceTypesRaw]);

  const servicesCatalog = useMemo<ServiceOption[]>(() => {
    return (servicesRaw || [])
      .map((s: any) => {
        const serviceid = Number(s?.serviceid ?? s?.id);
        const name = String(s?.name ?? s?.servicename ?? `Servicio #${serviceid}`).trim();
        const typeofserviceid = Number(s?.typeofserviceid ?? s?.typeOfServiceId ?? s?.typeofservice?.typeofserviceid);
        const typeofservicename = (s?.typeofservicename ?? s?.typeofservicename ?? s?.typeName ?? null) as any;
        const stateid = s?.stateid != null ? Number(s.stateid) : null;
        const statename = s?.statename != null ? String(s.statename) : null;
        return { serviceid, name, typeofserviceid, typeofservicename, stateid, statename } as ServiceOption;
      })
      .filter(
        (x) =>
          Number.isFinite(x.serviceid) &&
          x.serviceid > 0 &&
          Number.isFinite(x.typeofserviceid) &&
          x.typeofserviceid > 0
      );
  }, [servicesRaw]);

  function getServicesForTipo(tid: number | null) {
    if (!tid) return [];
    const list = servicesCatalog.filter((s) => s.typeofserviceid === tid);
    const active = list.filter(
      (s) => (s.stateid == null ? true : s.stateid === 1) || String(s.statename || "").toLowerCase() === "activo"
    );
    return active.length ? active : list;
  }

  const [quotesRaw, setQuotesRaw] = useState<any[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setQuotesLoading(true);
      setQuotesError(null);
      try {
        const { data } = await api.get("quotes");
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.quotes)
          ? data.quotes
          : [];
        if (!cancelled) setQuotesRaw(list);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "Error cargando cotizaciones.";
        if (!cancelled) {
          setQuotesError(String(msg));
          setQuotesRaw([]);
        }
      } finally {
        if (!cancelled) setQuotesLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const quoteMapById = useMemo(() => {
    const m = new Map<number, any>();
    for (const q of quotesRaw || []) {
      const id = pickNumber(q?.quotesid, q?.quotationid, q?.cotizacionid, q?.id);
      if (id) m.set(id, q);
    }
    return m;
  }, [quotesRaw]);

  const quoteOptions = useMemo(() => {
    const opts: Array<{ id: number; label: string }> = [];
    for (const q of quotesRaw || []) {
      const nq = normalizeQuote(q);
      const id = nq.quotesid ?? pickNumber(q?.quotesid, q?.quotationid, q?.cotizacionid, q?.id);
      if (!id) continue;

      const clientLabel =
        (nq.clientid && customers.find((c) => c.customerid === nq.clientid)?.label) ||
        (nq.clientid ? `Cliente #${nq.clientid}` : "Sin cliente");

      const typeLabel =
        (nq.typeofserviceid && serviceTypes.find((t) => t.typeofserviceid === nq.typeofserviceid)?.label) || "";

      const parts = [`#${id}`, clientLabel];
      if (typeLabel) parts.push(typeLabel);

      const hasServices = Array.isArray(nq.services) && nq.services.length > 0;
      const hasProducts = Array.isArray(nq.products) && nq.products.length > 0;
      const extra = [hasServices ? "con servicios" : "", hasProducts ? "con productos" : ""].filter(Boolean).join(" · ");
      if (extra) parts.push(extra);

      opts.push({ id, label: parts.join(" — ") });
    }
    opts.sort((a, b) => b.id - a.id);
    return opts;
  }, [quotesRaw, customers, serviceTypes]);

  const [selectedQuotesId, setSelectedQuotesId] = useState<number | "">("");

  const [quoteLoadingApply, setQuoteLoadingApply] = useState(false);
  const [quoteAppliedKey, setQuoteAppliedKey] = useState<string | null>(null);
  const [quoteApplyError, setQuoteApplyError] = useState<string | null>(null);

  const [clientId, setClientId] = useState<number | "">("");
  const selectedCustomer = useMemo(() => customers.find((c) => c.customerid === clientId), [customers, clientId]);

  const [tipoId, setTipoId] = useState<number | null>(null);
  const tipoSeleccionado = useMemo(
    () => serviceTypes.find((t) => t.typeofserviceid === tipoId) || null,
    [serviceTypes, tipoId]
  );

  const [descripcion, setDescripcion] = useState("");

  const [viaticosInput, setViaticosInput] = useState<string>("0");
  const viaticosValue = useMemo(() => {
    const raw = String(viaticosInput ?? "").trim();
    if (raw === "") return 0;
    const n = Number(raw);
    if (!Number.isFinite(n)) return NaN;
    return Math.max(0, Math.round(n));
  }, [viaticosInput]);

  const [dateStart, setDateStart] = useState(() => toLocalYMD(new Date()));
  const [timeStart, setTimeStart] = useState(() => {
    const now = new Date();
    const hm = toLocalHM(now);
    const mins = timeToMinutes(hm);
    if (!Number.isFinite(mins)) return "07:00";
    if (mins < SCHEDULE_MIN) return "07:00";
    if (mins > SCHEDULE_MAX) return "17:00";
    return hm;
  });
  const [dateEnd, setDateEnd] = useState(() => toLocalYMD(new Date()));
  const [timeEnd, setTimeEnd] = useState(() => {
    const now = new Date();
    const hm = toLocalHM(now);
    const mins = timeToMinutes(hm);
    if (!Number.isFinite(mins)) return "08:00";
    const end = Math.min(SCHEDULE_MAX, Math.max(SCHEDULE_MIN, mins) + 60);
    return minutesToTime(end);
  });

  const [selectedTechnicians, setSelectedTechnicians] = useState<number[]>([]);
  const selectedTechSet = useMemo(() => new Set(selectedTechnicians), [selectedTechnicians]);

  const [techQuery, setTechQuery] = useState("");
  const [techOpen, setTechOpen] = useState(false);
  const [techActiveIndex, setTechActiveIndex] = useState(0);
  const techBoxRef = useRef<HTMLDivElement>(null);
  const techInputRef = useRef<HTMLInputElement>(null);

  const [servicios, setServicios] = useState<ServiceLineItem[]>([]);
  const [materiales, setMateriales] = useState<MaterialLineItem[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  const summaryRef = useRef<HTMLDivElement>(null);

  const [saving, setSaving] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const submitLockRef = useRef(false);

  const isDesktop = useDesktopQuery();
  const sidebarW = useSidebarWidth("#app-sidebar");

  const inputBase =
    "w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200";
  const selectBase = `${inputBase} appearance-none pr-8`;
  const chevron = "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400";
  const errorText = "mt-1 text-xs text-red-600";
  const errorRing = "border-red-500 ring-1 ring-red-500";

  const hasErrors = useMemo(
    () => Object.values(errors).some((v) => typeof v === "string" && v.trim().length > 0),
    [errors]
  );

  function showFieldError(key: keyof Errors) {
    return !!errors[key] && (submitAttempted || !!touched[key]);
  }

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  const shownLookupErr = useRef<string | null>(null);
  useEffect(() => {
    if (!lookupsError) return;
    if (shownLookupErr.current === lookupsError) return;
    shownLookupErr.current = lookupsError;
    showError(lookupsError);
  }, [lookupsError]);

  const shownQuotesErr = useRef<string | null>(null);
  useEffect(() => {
    if (!quotesError) return;
    if (shownQuotesErr.current === quotesError) return;
    shownQuotesErr.current = quotesError;
    showError(quotesError);
  }, [quotesError]);

  const skipClearOnTipoChangeRef = useRef(false);

  useEffect(() => {
    if (skipClearOnTipoChangeRef.current) {
      skipClearOnTipoChangeRef.current = false;
      return;
    }
    setErrors((prev) => ({ ...prev, tipo: undefined }));
  }, [tipoId]);

  useEffect(() => {
    if (!techOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!techBoxRef.current) return;
      if (!techBoxRef.current.contains(t)) setTechOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [techOpen]);

  const selectedTechniciansFull = useMemo(() => {
    const map = new Map(technicians.map((t) => [t.technicianid, t]));
    return selectedTechnicians.map((id) => map.get(id)).filter(Boolean) as TechnicianOption[];
  }, [technicians, selectedTechnicians]);

  const techOptions = useMemo(() => {
    const q = normalizeText(techQuery);
    const list = technicians.filter((t) => !selectedTechSet.has(t.technicianid));
    if (!q) return list.slice(0, 10);
    const scored = list
      .map((t) => {
        const label = normalizeText(t.label);
        const idStr = String(t.technicianid);
        let score = 0;
        if (idStr.startsWith(q)) score += 3;
        if (label.includes(q)) score += 2;
        if (label.startsWith(q)) score += 1;
        return { t, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.t.label.localeCompare(b.t.label));
    return scored.slice(0, 10).map((x) => x.t);
  }, [technicians, techQuery, selectedTechSet]);

  useEffect(() => {
    setTechActiveIndex(0);
  }, [techQuery, techOpen]);

  function addTechnician(id: number) {
    if (!Number.isFinite(id) || id <= 0) return;
    setSelectedTechnicians((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setErrors((p) => ({ ...p, technicians: undefined }));
    setTechQuery("");
    setTechOpen(false);
    techInputRef.current?.focus();
  }

  function removeTechnician(id: number) {
    setSelectedTechnicians((prev) => prev.filter((x) => x !== id));
  }

  function clearTechnicians() {
    setSelectedTechnicians([]);
    setErrors((p) => ({ ...p, technicians: undefined }));
  }

  function patchItem<T extends { id: string }>(
    id: string,
    patch: Partial<T>,
    setList: React.Dispatch<React.SetStateAction<T[]>>
  ) {
    setList((prev) => prev.map((x) => (x.id === id ? ({ ...x, ...patch } as T) : x)));
  }

  function removeItem<T extends { id: string }>(id: string, setList: React.Dispatch<React.SetStateAction<T[]>>) {
    setList((prev) => prev.filter((x) => x.id !== id));
  }

  function serviceOptionsForRow(tipo: number, currentName: string) {
    const base = getServicesForTipo(tipo);
    if (!base.length) return [];
    const used = new Set(
      servicios
        .filter((s) => s.tipoId === tipo)
        .map((s) => String(s.nombre || "").trim())
        .filter(Boolean)
    );
    if (currentName) used.delete(currentName);
    return base.filter((opt) => !used.has(opt.name));
  }

  function addServiceRow() {
    if (!tipoId) return;
    const opts = serviceOptionsForRow(tipoId, "");
    const first = opts[0];
    if (!first) {
      showWarning("Ya agregaste todos los servicios disponibles para este tipo.");
      return;
    }
    setServicios((prev) => [...prev, { id: uid(), nombre: first.name, precio: 0, tipoId }]);
    setErrors((prev) => ({ ...prev, servicios: undefined }));
  }

  function dedupeAppend(newFs: File[]) {
    setFiles((prev) => {
      const map = new Map(prev.map((f) => [`${f.name}_${f.size}_${f.lastModified}`, f]));
      newFs.forEach((f) => {
        const k = `${f.name}_${f.size}_${f.lastModified}`;
        if (!map.has(k)) map.set(k, f);
      });
      return Array.from(map.values());
    });
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = Array.from(e.target.files || []);
    if (!fs.length) return;

    const MAX_FILES = 12;
    const MAX_SIZE = 5 * 1024 * 1024;

    const accepteds: File[] = [];
    const rejected: string[] = [];

    fs.forEach((f) => {
      const isImg = f.type.startsWith("image/");
      const okSize = f.size <= MAX_SIZE;
      if (isImg && okSize) accepteds.push(f);
      else rejected.push(`${f.name}${!isImg ? " (no es imagen)" : ""}${!okSize ? " (más de 5MB)" : ""}`);
    });

    const totalCount = accepteds.length + files.length;

    if (totalCount > MAX_FILES) {
      const allowed = Math.max(0, MAX_FILES - files.length);
      if (allowed > 0) dedupeAppend(accepteds.slice(0, allowed));
      showWarning(`Máximo ${MAX_FILES} imágenes. ${rejected.length ? "Algunas fueron rechazadas." : ""}`.trim());
    } else {
      dedupeAppend(accepteds);
      if (rejected.length) showWarning("Algunas imágenes fueron rechazadas (tipo/tamaño).");
    }

    e.currentTarget.value = "";
  }

  function removeFile(file: File) {
    setFiles((prev) =>
      prev.filter((f) => !(f.name === file.name && f.size === file.size && f.lastModified === file.lastModified))
    );
  }

  const subtotalServicios = useMemo(() => servicios.reduce((a, i) => a + 1 * (Number(i.precio) || 0), 0), [servicios]);

  const subtotalMateriales = useMemo(
    () => materiales.reduce((a, i) => a + (Number(i.cantidad) || 0) * (Number(i.precio) || 0), 0),
    [materiales]
  );

  const subtotal = subtotalServicios + subtotalMateriales;

  const baseGravable = useMemo(() => {
    const v = Number.isFinite(viaticosValue) ? viaticosValue : 0;
    return Math.max(0, Math.round(subtotal + v));
  }, [subtotal, viaticosValue]);

  const impuestos = useMemo(() => Math.max(0, Math.round((baseGravable * IVA_PCT) / 100)), [baseGravable]);
  const totalPagar = useMemo(() => Math.max(0, Math.round(baseGravable + impuestos)), [baseGravable, impuestos]);

  const serviciosMiniLista = useMemo(() => {
    const map = new Map<string, { nombre: string; cantidad: number; total: number }>();
    servicios.forEach((s) => {
      if (!s.nombre) return;
      const t = 1 * (Number(s.precio) || 0);
      const labelTipo = serviceTypes.find((t) => t.typeofserviceid === s.tipoId)?.label || `Tipo #${s.tipoId}`;
      const key = `[${labelTipo}] ${s.nombre}`;
      const prev = map.get(key);
      if (prev) {
        prev.cantidad += 1;
        prev.total += t;
      } else {
        map.set(key, { nombre: key, cantidad: 1, total: t });
      }
    });
    return Array.from(map.values());
  }, [servicios, serviceTypes]);

  const materialesMiniLista = useMemo(() => {
    const map = new Map<string, { nombre: string; cantidad: number; total: number }>();
    materiales.forEach((m) => {
      if (!m.nombre) return;
      const qty = Math.max(0, Math.round(Number(m.cantidad) || 0));
      if (!qty) return;
      const t = qty * (Number(m.precio) || 0);
      const prev = map.get(m.nombre);
      if (prev) {
        prev.cantidad += qty;
        prev.total += t;
      } else {
        map.set(m.nombre, { nombre: m.nombre, cantidad: qty, total: t });
      }
    });
    return Array.from(map.values());
  }, [materiales]);

  const materialesSelectedNames = useMemo(
    () => new Set(materiales.map((m) => String(m.nombre || "").trim()).filter(Boolean)),
    [materiales]
  );

  const availableProducts = useMemo(() => {
    return productsCatalog.filter((p) => !materialesSelectedNames.has(p.productname));
  }, [productsCatalog, materialesSelectedNames]);

  function precioMaterialPorNombre(nombre: string) {
    return productsCatalog.find((x) => x.productname === nombre)?.productpriceofsale ?? 0;
  }

  function materialOptionsForRow(currentName: string) {
    const used = new Set(materiales.map((m) => String(m.nombre || "").trim()).filter(Boolean));
    if (currentName) used.delete(currentName);
    return productsCatalog.filter((p) => !used.has(p.productname));
  }

  function addMaterialRow() {
    const first = availableProducts[0];
    if (!first) {
      showWarning("Ya agregaste todos los productos disponibles.");
      return;
    }
    setMateriales((prev) => [
      ...prev,
      { id: uid(), nombre: first.productname, precio: first.productpriceofsale, cantidad: 1 },
    ]);
    setErrors((prev) => ({ ...prev, materiales: undefined }));
  }

  useEffect(() => {
    if (!(submitAttempted || touched.servicios)) return;
    const msg = validateField("servicios");
    setErrors((p) => ({ ...p, servicios: msg }));
  }, [servicios, servicesCatalog, submitAttempted, touched.servicios]);

  useEffect(() => {
    if (!(submitAttempted || touched.materiales)) return;
    const msg = validateField("materiales");
    setErrors((p) => ({ ...p, materiales: msg }));
  }, [materiales, productsCatalog, submitAttempted, touched.materiales]);

  function validateScheduleOnly(): string | undefined {
    if (!dateStart || !timeStart || !dateEnd || !timeEnd) return "Completa fecha y hora de inicio y fin.";
    if (!isAllowedDate(dateStart) || !isAllowedDate(dateEnd)) return "Solo se permite agendar de lunes a sábado.";
    if (!isAllowedTime(timeStart) || !isAllowedTime(timeEnd)) return "Horario permitido: 07:00–17:00.";

    const sDate = parseYMD(dateStart);
    const eDate = parseYMD(dateEnd);
    if (!sDate || !eDate) return "Fecha inválida.";

    const s = new Date(sDate);
    const e = new Date(eDate);
    const sMin = timeToMinutes(timeStart);
    const eMin = timeToMinutes(timeEnd);
    if (!Number.isFinite(sMin) || !Number.isFinite(eMin)) return "Hora inválida.";
    s.setHours(Math.floor(sMin / 60), sMin % 60, 0, 0);
    e.setHours(Math.floor(eMin / 60), eMin % 60, 0, 0);

    if (!(e.getTime() > s.getTime())) return "La fecha/hora fin debe ser mayor que la de inicio.";
    if (timeStart === "17:00") return "La hora de inicio no puede ser 17:00.";
    return undefined;
  }

  function validateForm(): Errors {
    const errs: Errors = {};

    if (!clientId) errs.clientId = "Selecciona un cliente.";

    if (!servicios.length && !tipoId) errs.tipo = "Selecciona el tipo de servicio.";

    const sch = validateScheduleOnly();
    if (sch) errs.schedule = sch;

    if (!selectedTechnicians.length) errs.technicians = "Selecciona al menos un técnico.";

    if (!Number.isFinite(viaticosValue)) errs.viaticos = "Viáticos debe ser un número válido.";
    if (Number.isFinite(viaticosValue) && viaticosValue < 0) errs.viaticos = "Viáticos no puede ser negativo.";

    if (servicios.length === 0) {
      errs.servicios = "Debes añadir al menos un servicio.";
    } else {
      const invalidSvc = servicios.some((s) => {
        if (!s.tipoId) return true;
        return !servicesCatalog.some((x) => x.name === s.nombre && x.typeofserviceid === s.tipoId);
      });
      if (invalidSvc) errs.servicios = "Hay servicios inválidos. Vuelve a seleccionarlos.";

      const badPriceSvc = servicios.some((s) => !Number.isFinite(Number(s.precio)) || Number(s.precio) < 0);
      if (badPriceSvc) errs.servicios = (errs.servicios ? errs.servicios + " " : "") + "Corrige precios de servicios.";

      const dupByType = (() => {
        const map = new Map<number, Set<string>>();
        for (const s of servicios) {
          const name = String(s.nombre || "").trim();
          if (!name) continue;
          const set = map.get(s.tipoId) ?? new Set<string>();
          if (set.has(name)) return true;
          set.add(name);
          map.set(s.tipoId, set);
        }
        return false;
      })();
      if (dupByType)
        errs.servicios =
          (errs.servicios ? errs.servicios + " " : "") + "No puedes repetir el mismo servicio dentro del mismo tipo.";
    }

    if (!productsCatalog.length) errs.materiales = "No hay productos cargados desde la BD.";
    if (materiales.length === 0)
      errs.materiales = errs.materiales ? errs.materiales : "Debes añadir al menos un producto (material).";

    const dupMat =
      materiales.length > 1 && new Set(materiales.map((m) => String(m.nombre || "").trim())).size !== materiales.length;
    if (dupMat) errs.materiales = (errs.materiales ? errs.materiales + " " : "") + "No puedes repetir el mismo producto.";

    if (materiales.some((m) => !productsCatalog.some((p) => p.productname === m.nombre))) {
      errs.materiales =
        (errs.materiales ? errs.materiales + " " : "") + "Hay productos inválidos. Vuelve a seleccionarlos.";
    }

    const badQty = materiales.some((m) => !Number.isFinite(Number(m.cantidad)) || Number(m.cantidad) < 1);
    if (badQty) errs.materiales = (errs.materiales ? errs.materiales + " " : "") + "Corrige cantidades (mínimo 1).";

    return errs;
  }

  function validateField(key: keyof Errors): string | undefined {
    if (key === "clientId") {
      if (!clientId) return "Selecciona un cliente.";
      return undefined;
    }
    if (key === "tipo") {
      if (servicios.length > 0) return undefined;
      if (!tipoId) return "Selecciona el tipo de servicio.";
      return undefined;
    }
    if (key === "schedule") return validateScheduleOnly();
    if (key === "technicians") {
      if (!selectedTechnicians.length) return "Selecciona al menos un técnico.";
      return undefined;
    }
    if (key === "viaticos") {
      if (!Number.isFinite(viaticosValue)) return "Viáticos debe ser un número válido.";
      if (Number.isFinite(viaticosValue) && viaticosValue < 0) return "Viáticos no puede ser negativo.";
      return undefined;
    }
    if (key === "servicios") {
      if (servicios.length === 0) return "Debes añadir al menos un servicio.";
      const invalidSvc = servicios.some((s) => {
        if (!s.tipoId) return true;
        return !servicesCatalog.some((x) => x.name === s.nombre && x.typeofserviceid === s.tipoId);
      });
      if (invalidSvc) return "Hay servicios inválidos. Vuelve a seleccionarlos.";
      const badPriceSvc = servicios.some((s) => !Number.isFinite(Number(s.precio)) || Number(s.precio) < 0);
      if (badPriceSvc) return "Corrige precios de servicios.";
      const dupByType = (() => {
        const map = new Map<number, Set<string>>();
        for (const s of servicios) {
          const name = String(s.nombre || "").trim();
          if (!name) continue;
          const set = map.get(s.tipoId) ?? new Set<string>();
          if (set.has(name)) return true;
          set.add(name);
          map.set(s.tipoId, set);
        }
        return false;
      })();
      if (dupByType) return "No puedes repetir el mismo servicio dentro del mismo tipo.";
      return undefined;
    }
    if (key === "materiales") {
      if (!productsCatalog.length) return "No hay productos cargados desde la BD.";
      if (materiales.length === 0) return "Debes añadir al menos un producto (material).";
      const dupMat =
        materiales.length > 1 && new Set(materiales.map((m) => String(m.nombre || "").trim())).size !== materiales.length;
      if (dupMat) return "No puedes repetir el mismo producto.";
      if (materiales.some((m) => !productsCatalog.some((p) => p.productname === m.nombre)))
        return "Hay productos inválidos. Vuelve a seleccionarlos.";
      if (materiales.some((m) => !Number.isFinite(Number(m.cantidad)) || Number(m.cantidad) < 1))
        return "Corrige cantidades (mínimo 1).";
      return undefined;
    }
    return undefined;
  }

  function runBlurValidation(key: keyof Errors) {
    setTouched((t) => ({ ...t, [key]: true }));
    const msg = validateField(key);
    setErrors((p) => ({ ...p, [key]: msg }));
  }

  useEffect(() => {
    if (!(submitAttempted || touched.tipo)) return;
    setErrors((p) => ({ ...p, tipo: validateField("tipo") }));
  }, [submitAttempted, touched.tipo, tipoId, servicios.length]);

  useEffect(() => {
    if (!(submitAttempted || touched.servicios)) return;
    setErrors((p) => ({ ...p, servicios: validateField("servicios") }));
  }, [submitAttempted, touched.servicios, servicios, servicesCatalog]);

  useEffect(() => {
    if (!(submitAttempted || touched.materiales)) return;
    setErrors((p) => ({ ...p, materiales: validateField("materiales") }));
  }, [submitAttempted, touched.materiales, materiales, productsCatalog]);

  function focusFirstError(er: Errors) {
    const order = ["quote", "clientId", "tipo", "schedule", "technicians", "viaticos", "materiales", "servicios"] as const;
    const key = order.find((k) => (er as any)[k]);
    if (!key) return;
    const el = document.getElementById(`field-${key}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLElement).focus?.();
    } else {
      summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function uploadFilesToCloudinary(fs: File[]) {
    const urls: string[] = [];
    for (const f of fs) {
      const res: any = await uploadImageToCloudinary(f);
      if (typeof res === "string") urls.push(res);
      else if (res?.secure_url) urls.push(res.secure_url);
      else if (res?.url) urls.push(res.url);
    }
    return urls;
  }

  function clampAutoEnd(date: string, startHm: string) {
    const s = timeToMinutes(startHm);
    const end = Math.min(SCHEDULE_MAX, (Number.isFinite(s) ? s : SCHEDULE_MIN) + 60);
    return { date, time: minutesToTime(end) };
  }

  const [customerQuery, setCustomerQuery] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerActiveIndex, setCustomerActiveIndex] = useState(0);
  const customerBoxRef = useRef<HTMLDivElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!customerOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!customerBoxRef.current) return;
      if (!customerBoxRef.current.contains(t)) setCustomerOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [customerOpen]);

  const customerOptions = useMemo(() => {
    const q = normalizeText(customerQuery);
    if (!q) return customers.slice(0, 10);
    const scored = customers
      .map((c) => {
        const label = normalizeText(c.label);
        const idStr = String(c.customerid);
        let score = 0;
        if (idStr.startsWith(q)) score += 3;
        if (label.includes(q)) score += 2;
        if (label.startsWith(q)) score += 1;
        return { c, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.c.label.localeCompare(b.c.label));
    return scored.slice(0, 10).map((x) => x.c);
  }, [customers, customerQuery]);

  useEffect(() => {
    setCustomerActiveIndex(0);
  }, [customerQuery, customerOpen]);

  function pickCustomer(id: number) {
    if (!Number.isFinite(id) || id <= 0) return;
    setClientId(id as any);
    setErrors((p) => ({ ...p, clientId: undefined }));
    setCustomerQuery("");
    setCustomerOpen(false);
  }

  function clearCustomer() {
    setClientId("");
    setCustomerQuery("");
    setCustomerOpen(false);
    customerInputRef.current?.focus();
  }

  function resetPrefill() {
    setSubmitAttempted(false);
    setQuoteApplyError(null);
    setSelectedQuotesId("");
    setClientId("");
    skipClearOnTipoChangeRef.current = true;
    setTipoId(null);
    setDescripcion("");
    setSelectedTechnicians([]);
    setServicios([]);
    setMateriales([]);
    setFiles([]);
    setViaticosInput("0");
    const now = new Date();
    const ds = coerceAllowedDateOrNext(toLocalYMD(now));
    const ts = coerceAllowedTime(toLocalHM(now), "07:00");
    const autoEnd = clampAutoEnd(ds, ts);
    setDateStart(ds);
    setTimeStart(ts);
    setDateEnd(autoEnd.date);
    setTimeEnd(autoEnd.time);
    setErrors({});
    setTouched({});
    setQuoteAppliedKey(null);
    setCustomerQuery("");
    setCustomerOpen(false);
  }

  function applyNormalizedQuote(nq: QuoteNormalized, key: string) {
    const nextClient = nq.clientid && customers.some((c) => c.customerid === nq.clientid) ? nq.clientid : "";
    setClientId(nextClient as any);

    const inferredTypeFromServices =
      nq.services && nq.services.length
        ? servicesCatalog.find((x) => x.serviceid === nq.services![0].serviceid)?.typeofserviceid ?? null
        : null;

    const candidateType = nq.typeofserviceid ?? inferredTypeFromServices;

    const typeId =
      candidateType && serviceTypes.some((t) => t.typeofserviceid === candidateType) ? candidateType : null;

    skipClearOnTipoChangeRef.current = true;
    setTipoId(typeId);

    const techIds = (nq.technicians || []).filter((id) => technicians.some((t) => t.technicianid === id));
    setSelectedTechnicians(techIds);

    const v = Number.isFinite(Number(nq.viaticos)) ? Math.max(0, Math.round(Number(nq.viaticos))) : 0;
    setViaticosInput(String(v));

    const ds = coerceAllowedDateOrNext(nq.fechainicio || toLocalYMD(new Date()));
    const de = coerceAllowedDateOrNext(nq.fechafin || ds);

    const baseTs = coerceAllowedTime(String((nq.horainicio || "07:00")).slice(0, 5), "07:00");
    let baseTe = coerceAllowedTime(
      String((nq.horafin || "08:00")).slice(0, 5),
      minutesToTime(Math.min(SCHEDULE_MAX, timeToMinutes(baseTs) + 60))
    );

    const sMin = timeToMinutes(baseTs);
    const eMin = timeToMinutes(baseTe);
    if (Number.isFinite(sMin) && Number.isFinite(eMin) && eMin <= sMin) {
      baseTe = minutesToTime(Math.min(SCHEDULE_MAX, sMin + 60));
    }

    setDateStart(ds);
    setTimeStart(baseTs);
    setDateEnd(de);
    setTimeEnd(baseTe);

    const freeText = extractFreeTextFromDescription(nq.description || "");
    setDescripcion(freeText);

    const svcItems: ServiceLineItem[] = [];
    if (Array.isArray(nq.services) && nq.services.length) {
      for (const s of nq.services) {
        const rec = servicesCatalog.find((x) => x.serviceid === s.serviceid) || null;
        const nombre = rec?.name || `Servicio #${s.serviceid}`;
        const precio = Math.max(0, Math.round(Number(s.unitprice || 0)));
        const tid = rec?.typeofserviceid ?? typeId ?? 0;
        if (!tid) continue;
        svcItems.push({ id: uid(), nombre, precio, tipoId: tid });
      }
    }
    setServicios(svcItems);

    const matItems: MaterialLineItem[] = [];
    if (Array.isArray(nq.products) && nq.products.length) {
      const used = new Set<number>();
      for (const p of nq.products) {
        const pid = Number(p.productid);
        if (!Number.isFinite(pid) || pid <= 0) continue;
        if (used.has(pid)) continue;
        used.add(pid);
        const rec = productsCatalog.find((x) => x.productid === pid) || null;
        if (!rec) continue;
        const precio = p.unitprice != null ? Math.max(0, Math.round(Number(p.unitprice))) : rec.productpriceofsale ?? 0;
        const cantidad = Math.max(1, Math.round(Number(p.cantidad ?? 1)));
        matItems.push({ id: uid(), nombre: rec.productname, precio, cantidad });
      }
    }
    setMateriales(matItems);

    setSubmitAttempted(false);
    setErrors({});
    setTouched({});
    setQuoteAppliedKey(key);
    setCustomerQuery("");
    setCustomerOpen(false);
  }

  useEffect(() => {
    if (lookupsLoading) return;
    if (!customers.length || !technicians.length || !productsCatalog.length || !serviceTypes.length) return;

    const keyFromUrl = quotesIdFromUrl
      ? `url:id:${quotesIdFromUrl}`
      : quoteDataParam
      ? `url:param:${String(quoteDataParam).slice(0, 32)}`
      : null;
    if (!keyFromUrl) return;
    if (quoteAppliedKey === keyFromUrl) return;

    let cancelled = false;

    async function run() {
      setQuoteApplyError(null);
      setQuoteLoadingApply(true);
      try {
        let raw: any = null;

        if (quotesIdFromUrl) {
          raw = quoteMapById.get(quotesIdFromUrl) ?? null;
          if (!raw) throw new Error(`No se encontró la cotización #${quotesIdFromUrl} en /quotes`);
        } else if (quoteDataParam) {
          raw = parseQuoteParam(String(quoteDataParam || ""));
          if (!raw) throw new Error("No se pudo leer la cotización desde la URL.");
        }

        const nq = normalizeQuote(raw);
        if (cancelled) return;

        applyNormalizedQuote(nq, keyFromUrl);
        if (quotesIdFromUrl) setSelectedQuotesId(quotesIdFromUrl);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "Error cargando cotización.";
        setQuoteApplyError(String(msg));
        showError(String(msg));
      } finally {
        if (!cancelled) setQuoteLoadingApply(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [
    lookupsLoading,
    customers,
    technicians,
    productsCatalog,
    serviceTypes,
    servicesCatalog,
    quotesIdFromUrl,
    quoteDataParam,
    quoteAppliedKey,
    quoteMapById,
  ]);

  useEffect(() => {
    if (!selectedQuotesId) return;
    if (lookupsLoading) return;
    if (!customers.length || !technicians.length || !productsCatalog.length || !serviceTypes.length) return;

    const id = Number(selectedQuotesId);
    if (!Number.isFinite(id) || id <= 0) return;

    const key = `select:id:${id}`;
    if (quoteAppliedKey === key) return;

    const raw = quoteMapById.get(id);
    if (!raw) {
      const msg = `La cotización #${id} no está disponible en el listado de /quotes.`;
      setQuoteApplyError(msg);
      showError(msg);
      return;
    }

    setQuoteApplyError(null);
    setQuoteLoadingApply(true);
    try {
      const nq = normalizeQuote(raw);
      applyNormalizedQuote(nq, key);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Error aplicando cotización.";
      setQuoteApplyError(String(msg));
      showError(String(msg));
    } finally {
      setQuoteLoadingApply(false);
    }
  }, [
    selectedQuotesId,
    lookupsLoading,
    customers,
    technicians,
    productsCatalog,
    serviceTypes,
    servicesCatalog,
    quoteAppliedKey,
    quoteMapById,
  ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (submitLockRef.current) return;
    if (saving || navigating) return;
    submitLockRef.current = true;

    setSubmitAttempted(true);
    setTouched({
      quote: true,
      clientId: true,
      tipo: true,
      schedule: true,
      technicians: true,
      viaticos: true,
      materiales: true,
      servicios: true,
    });

    const er = validateForm();
    setErrors(er);
    if (Object.keys(er).length > 0) {
      showWarning("Revisa los campos marcados en rojo.");
      focusFirstError(er);
      submitLockRef.current = false;
      return;
    }

    const productQtyById = new Map<number, number>();
    for (const m of materiales) {
      const rec = productsCatalog.find((p) => p.productname === m.nombre);
      if (!rec) {
        const next = { ...er, materiales: `El producto "${m.nombre}" no existe en la BD. Vuelve a seleccionarlo.` };
        setErrors(next);
        showError(next.materiales || "Producto inválido.");
        focusFirstError(next);
        return;
      }
      const qty = Math.max(1, Math.round(Number(m.cantidad || 1)));
      productQtyById.set(rec.productid, (productQtyById.get(rec.productid) || 0) + qty);
    }

    const products = Array.from(productQtyById.entries()).map(([productid, cantidad]) => ({
      productid,
      cantidad,
    }));

    const serviceMap = new Map<string, { serviceid: number; cantidad: number; unitprice: number }>();
    for (const s of servicios) {
      const rec = servicesCatalog.find((x) => x.name === s.nombre && x.typeofserviceid === s.tipoId) || null;
      if (!rec) {
        const next = {
          ...er,
          servicios: `El servicio "${s.nombre}" no existe o no corresponde al tipo con el que fue agregado.`,
        };
        setErrors(next);
        showError(next.servicios || "Servicio inválido.");
        focusFirstError(next);
        return;
      }
      const unitprice = Math.max(0, Math.round(Number(s.precio || 0)));
      const key = `${rec.serviceid}_${unitprice}`;
      const prev = serviceMap.get(key);
      if (prev) prev.cantidad += 1;
      else serviceMap.set(key, { serviceid: rec.serviceid, cantidad: 1, unitprice });
    }

    const services = Array.from(serviceMap.values());
    const finalDescription = String(descripcion || "").trim();

    setSaving(true);
    try {
      const uploadedUrls = files.length ? await uploadFilesToCloudinary(files) : [];

      const dto: CreateOrdersServiceDto = {
        description: finalDescription,
        clientid: Number(clientId),
        stateid: pendingStateId ?? 1,
        fechainicio: dateStart,
        fechafin: dateEnd,
        horainicio: timeStart,
        horafin: timeEnd,
        technicians: selectedTechnicians,
        products,
        services,
        files: uploadedUrls,
        viaticos: Number.isFinite(viaticosValue) ? viaticosValue : 0,
      };

      const created: any = await createOrderService(dto);

      try {
        if (typeof window !== "undefined") {
          const createdId = Number(
            created?.ordersservicesid ??
              created?.id ??
              created?.data?.ordersservicesid ??
              created?.data?.id
          );
          const message = Number.isFinite(createdId) && createdId > 0 ? `Orden #${createdId} creada correctamente.` : "Orden creada correctamente.";
          sessionStorage.setItem("flash_toast", JSON.stringify({ type: "success", message }));
        }
      } catch {}
setNavigating(true);

      if (returnTo === pathname) {
        setNavigating(false);
        setSaving(false);
        router.refresh();
        return;
      }

      router.push(returnTo);
      return;
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || "Error inesperado.");
      setNavigating(false);
      setSaving(false);
      submitLockRef.current = false;
    }
  }

  function handleDateStartChange(next: string) {
    setDateStart(next);
    if (errors.schedule) setErrors((p) => ({ ...p, schedule: undefined }));
  }

  function handleDateEndChange(next: string) {
    setDateEnd(next);
    if (errors.schedule) setErrors((p) => ({ ...p, schedule: undefined }));
  }

  function handleTimeStartChange(next: string) {
    setTimeStart(next);
    if (errors.schedule) setErrors((p) => ({ ...p, schedule: undefined }));
  }

  function handleTimeEndChange(next: string) {
    setTimeEnd(next);
    if (errors.schedule) setErrors((p) => ({ ...p, schedule: undefined }));
  }

  const StickyFooter = () => (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-white/85 backdrop-blur border-t">
        <div className="mx-auto max-w-7xl px-4 py-3" style={{ paddingLeft: isDesktop ? sidebarW + 16 : 16 }}>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm">
              <div className="text-xs text-gray-500">Total estimado</div>
              <div className="text-lg font-semibold text-gray-900">{formatCOP(totalPagar)}</div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => router.push(returnTo)}
                className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                disabled={saving || navigating}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="order-form"
                className="h-10 rounded-md bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
                disabled={saving || navigating || lookupsLoading}
              >
                {saving ? (navigating ? "Redirigiendo..." : "Guardando...") : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const timeStartMax = "16:59";
  const timeMin = "07:00";
  const timeMax = "17:00";
  const showPrefillBanner = !!quoteAppliedKey;

  return (
    <RequireAuth>
      <div className="relative" style={{ paddingLeft: isDesktop ? sidebarW : 0 }}>
        <main className="min-h-[100dvh] bg-gray-100 pb-36 md:pb-40">
          <div className="px-4 pt-4 max-w-7xl w-full mx-auto">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-gray-900 truncate">Crear orden de servicio</h1>
                <p className="text-xs text-gray-500 mt-1">Completa el cliente, programación y detalles del servicio.</p>
              </div>
            </div>

            <section className="mb-4 rounded-xl border bg-white shadow-sm" id="field-quote">
              <header className="border-b px-4 py-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-800">Cotización (opcional)</div>
                <div className="text-xs text-gray-500">
                  {quotesLoading ? "Cargando..." : quoteOptions.length ? `${quoteOptions.length} disponibles` : "—"}
                </div>
              </header>

              <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-9">
                  <label className="block text-xs text-gray-700 mb-1" htmlFor="field-quote-select">
                    Seleccionar cotización para precargar el formulario
                  </label>
                  <div className="relative">
                    <select
                      id="field-quote-select"
                      value={selectedQuotesId === "" ? "" : String(selectedQuotesId)}
                      onChange={(e) => {
                        const v = e.target.value ? Number(e.target.value) : "";
                        setSelectedQuotesId((Number.isFinite(v) && v > 0 ? v : "") as any);
                        setErrors((p) => ({ ...p, quote: undefined }));
                        setTouched((t) => ({ ...t, quote: true }));
                      }}
                      className={`${selectBase} ${showFieldError("quote") ? errorRing : ""}`}
                      disabled={quotesLoading || lookupsLoading || quoteOptions.length === 0 || saving || navigating}
                      aria-invalid={showFieldError("quote")}
                    >
                      <option value="">
                        {quotesLoading
                          ? "Cargando cotizaciones..."
                          : quoteOptions.length
                          ? "Elige una cotización"
                          : "No hay cotizaciones"}
                      </option>
                      {quoteOptions.map((q) => (
                        <option key={q.id} value={String(q.id)}>
                          {q.label}
                        </option>
                      ))}
                    </select>
                    <span className={chevron}>▾</span>
                  </div>
                  {quotesError && <p className={errorText}>{quotesError}</p>}
                  {quoteApplyError && <p className={errorText}>{quoteApplyError}</p>}
                  {quoteLoadingApply && <div className="mt-2 text-xs text-gray-500">Aplicando cotización al formulario...</div>}
                  {showPrefillBanner && !quoteLoadingApply && <div className="mt-2 text-xs text-emerald-700">Cotización aplicada al formulario.</div>}
                </div>

                <div className="md:col-span-3 flex items-end gap-2">
                  <button
                    type="button"
                    onClick={resetPrefill}
                    className="w-full h-10 rounded-md border bg-white text-sm hover:bg-gray-50 disabled:opacity-60"
                    disabled={saving || navigating || lookupsLoading}
                  >
                    Limpiar formulario
                  </button>
                </div>
              </div>
            </section>

            {submitAttempted && hasErrors && (
              <div ref={summaryRef} className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-800 p-3 text-sm">
                <strong className="block mb-1">Hay errores en el formulario:</strong>
                <ul className="list-disc pl-5 space-y-1">
                  {errors.quote && <li>{errors.quote}</li>}
                  {errors.clientId && <li>{errors.clientId}</li>}
                  {errors.tipo && <li>{errors.tipo}</li>}
                  {errors.schedule && <li>{errors.schedule}</li>}
                  {errors.technicians && <li>{errors.technicians}</li>}
                  {errors.viaticos && <li>{errors.viaticos}</li>}
                  {errors.materiales && <li>{errors.materiales}</li>}
                  {errors.servicios && <li>{errors.servicios}</li>}
                </ul>
              </div>
            )}

            <form id="order-form" onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-6">
                <section className="rounded-xl border bg-white shadow-sm">
                  <header className="border-b px-4 py-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-800">Cliente</div>
                    <div className="text-xs text-gray-500">{customers.length ? `${customers.length} disponibles` : "—"}</div>
                  </header>

                  <div className="p-4 grid grid-cols-1 gap-3" id="field-clientId">
                    <div className={`rounded-lg border bg-gray-50 p-3 ${showFieldError("clientId") ? errorRing : ""}`}>
                      {!selectedCustomer ? (
                        <div className="text-xs text-gray-500">No has seleccionado cliente.</div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white text-xs font-semibold">
                              {initials(selectedCustomer.label)}
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">{selectedCustomer.label}</div>
                              <div className="text-xs text-gray-600 truncate">
                                {`Cliente #${selectedCustomer.customerid}`}
                                {selectedCustomer.phone || selectedCustomer.email ? ` · ${selectedCustomer.phone || selectedCustomer.email}` : ""}
                                {[selectedCustomer.city, selectedCustomer.zipcode].filter(Boolean).length
                                  ? ` · ${[selectedCustomer.city, selectedCustomer.zipcode].filter(Boolean).join(" • ")}`
                                  : ""}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={clearCustomer}
                            className="h-9 px-3 rounded-md border bg-white text-xs hover:bg-gray-50 disabled:opacity-60"
                            aria-label="Quitar cliente"
                            title="Quitar"
                            disabled={lookupsLoading || saving || navigating}
                          >
                            Quitar
                          </button>
                        </div>
                      )}
                    </div>

                    <div ref={customerBoxRef} className="relative">
                      <label className="block text-xs text-gray-700 mb-1" htmlFor="field-customer-search">
                        Buscar y seleccionar cliente
                      </label>
                      <input
                        id="field-customer-search"
                        ref={customerInputRef}
                        value={customerQuery}
                        onChange={(e) => {
                          setCustomerQuery(e.target.value);
                          setCustomerOpen(true);
                          if (errors.clientId) setErrors((p) => ({ ...p, clientId: undefined }));
                        }}
                        onFocus={() => setCustomerOpen(true)}
                        onBlur={() => runBlurValidation("clientId")}
                        onKeyDown={(e) => {
                          if (!customerOpen) return;
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setCustomerActiveIndex((i) => Math.min(i + 1, Math.max(0, customerOptions.length - 1)));
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setCustomerActiveIndex((i) => Math.max(i - 1, 0));
                          } else if (e.key === "Enter") {
                            if (customerOptions[customerActiveIndex]) {
                              e.preventDefault();
                              pickCustomer(customerOptions[customerActiveIndex].customerid);
                            }
                          } else if (e.key === "Escape") {
                            setCustomerOpen(false);
                          }
                        }}
                        placeholder="Nombre, apellido o ID..."
                        className={`${inputBase} ${showFieldError("clientId") ? errorRing : ""}`}
                        disabled={lookupsLoading || saving || navigating}
                        aria-expanded={customerOpen}
                        aria-controls="customer-suggest"
                        aria-autocomplete="list"
                      />

                      {customerOpen && !lookupsLoading && !(saving || navigating) && (
                        <div id="customer-suggest" className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border bg-white shadow-sm">
                          {customerOptions.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-gray-500">No hay coincidencias.</div>
                          ) : (
                            <ul className="max-h-60 overflow-auto">
                              {customerOptions.map((c, idx) => (
                                <li key={c.customerid}>
                                  <button
                                    type="button"
                                    onMouseDown={(ev) => ev.preventDefault()}
                                    onClick={() => pickCustomer(c.customerid)}
                                    onMouseEnter={() => setCustomerActiveIndex(idx)}
                                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                                      idx === customerActiveIndex ? "bg-gray-100" : "bg-white"
                                    }`}
                                  >
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-gray-50 text-xs font-semibold">
                                      {initials(c.label)}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block truncate font-medium">{c.label}</span>
                                      <span className="block text-xs text-gray-500">Cliente #{c.customerid}</span>
                                    </span>
                                    <span className="text-xs text-gray-400">Seleccionar</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>

                    {showFieldError("clientId") && errors.clientId && <p className={errorText}>{errors.clientId}</p>}
                  </div>
                </section>

                <section className="rounded-xl border bg-white shadow-sm">
                  <header className="border-b px-4 py-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-800">Programación</div>
                    <div className="text-xs text-gray-500">Lun–Sáb · 07:00–17:00</div>
                  </header>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4" id="field-schedule">
                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-700 mb-1" htmlFor="field-dateStart">
                        Fecha inicio
                      </label>
                      <input
                        id="field-dateStart"
                        type="date"
                        value={dateStart}
                        onChange={(e) => handleDateStartChange(e.target.value)}
                        onBlur={() => runBlurValidation("schedule")}
                        className={`${inputBase} ${showFieldError("schedule") ? errorRing : ""}`}
                        disabled={saving || navigating}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-700 mb-1" htmlFor="field-timeStart">
                        Hora inicio
                      </label>
                      <input
                        id="field-timeStart"
                        type="time"
                        min={timeMin}
                        max={timeStartMax}
                        value={timeStart}
                        onChange={(e) => handleTimeStartChange(e.target.value)}
                        onBlur={() => runBlurValidation("schedule")}
                        className={`${inputBase} ${showFieldError("schedule") ? errorRing : ""}`}
                        disabled={saving || navigating}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-700 mb-1" htmlFor="field-dateEnd">
                        Fecha fin
                      </label>
                      <input
                        id="field-dateEnd"
                        type="date"
                        value={dateEnd}
                        onChange={(e) => handleDateEndChange(e.target.value)}
                        onBlur={() => runBlurValidation("schedule")}
                        className={`${inputBase} ${showFieldError("schedule") ? errorRing : ""}`}
                        disabled={saving || navigating}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-700 mb-1" htmlFor="field-timeEnd">
                        Hora fin
                      </label>
                      <input
                        id="field-timeEnd"
                        type="time"
                        min={timeMin}
                        max={timeMax}
                        value={timeEnd}
                        onChange={(e) => handleTimeEndChange(e.target.value)}
                        onBlur={() => runBlurValidation("schedule")}
                        className={`${inputBase} ${showFieldError("schedule") ? errorRing : ""}`}
                        disabled={saving || navigating}
                      />
                    </div>

                    {showFieldError("schedule") && errors.schedule && (
                      <div className="md:col-span-12">
                        <p className={errorText}>{errors.schedule}</p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-xl border bg-white shadow-sm" id="field-technicians">
                  <header className="border-b px-4 py-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-800">Técnicos</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500">
                        Seleccionados: <span className="font-semibold text-gray-900">{selectedTechnicians.length}</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearTechnicians}
                        className="h-8 rounded-md border bg-white px-3 text-xs hover:bg-gray-50 disabled:opacity-60"
                        disabled={lookupsLoading || selectedTechnicians.length === 0 || saving || navigating}
                      >
                        Limpiar
                      </button>
                    </div>
                  </header>

                  <div className="p-4 grid grid-cols-1 gap-3">
                    <div className={`rounded-lg border bg-gray-50 p-3 ${showFieldError("technicians") ? errorRing : ""}`}>
                      {selectedTechniciansFull.length === 0 ? (
                        <div className="text-xs text-gray-500">No has seleccionado técnicos.</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedTechniciansFull.map((t) => (
                            <span
                              key={t.technicianid}
                              className="inline-flex items-center gap-2 rounded-full border bg-white px-2 py-1 text-xs"
                            >
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-gray-50 text-[10px] font-semibold">
                                {initials(t.label)}
                              </span>
                              <span className="max-w-[220px] truncate">
                                #{t.technicianid} — {t.label}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeTechnician(t.technicianid)}
                                className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-gray-200"
                                aria-label="Quitar técnico"
                                title="Quitar"
                                disabled={lookupsLoading || saving || navigating}
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div ref={techBoxRef} className="relative">
                      <label className="block text-xs text-gray-700 mb-1" htmlFor="field-tech-search">
                        Buscar y agregar técnico
                      </label>
                      <input
                        id="field-tech-search"
                        ref={techInputRef}
                        value={techQuery}
                        onChange={(e) => {
                          setTechQuery(e.target.value);
                          setTechOpen(true);
                          if (errors.technicians) setErrors((p) => ({ ...p, technicians: undefined }));
                        }}
                        onFocus={() => setTechOpen(true)}
                        onBlur={() => runBlurValidation("technicians")}
                        onKeyDown={(e) => {
                          if (!techOpen) return;
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setTechActiveIndex((i) => Math.min(i + 1, Math.max(0, techOptions.length - 1)));
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setTechActiveIndex((i) => Math.max(i - 1, 0));
                          } else if (e.key === "Enter") {
                            if (techOptions[techActiveIndex]) {
                              e.preventDefault();
                              addTechnician(techOptions[techActiveIndex].technicianid);
                            }
                          } else if (e.key === "Escape") {
                            setTechOpen(false);
                          }
                        }}
                        placeholder="Nombre, apellido o ID..."
                        className={`${inputBase} ${showFieldError("technicians") ? errorRing : ""}`}
                        disabled={lookupsLoading || saving || navigating}
                        aria-expanded={techOpen}
                        aria-controls="tech-suggest"
                        aria-autocomplete="list"
                      />

                      {techOpen && !lookupsLoading && !(saving || navigating) && (
                        <div id="tech-suggest" className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border bg-white shadow-sm">
                          {techOptions.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-gray-500">
                              {selectedTechnicians.length === technicians.length ? "Ya seleccionaste todos los técnicos." : "No hay coincidencias."}
                            </div>
                          ) : (
                            <ul className="max-h-60 overflow-auto">
                              {techOptions.map((t, idx) => (
                                <li key={t.technicianid}>
                                  <button
                                    type="button"
                                    onMouseDown={(ev) => ev.preventDefault()}
                                    onClick={() => addTechnician(t.technicianid)}
                                    onMouseEnter={() => setTechActiveIndex(idx)}
                                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                                      idx === techActiveIndex ? "bg-gray-100" : "bg-white"
                                    }`}
                                  >
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-gray-50 text-xs font-semibold">
                                      {initials(t.label)}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block truncate font-medium">{t.label}</span>
                                      <span className="block text-xs text-gray-500">Técnico #{t.technicianid}</span>
                                    </span>
                                    <span className="text-xs text-gray-400">Agregar</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>

                    {showFieldError("technicians") && errors.technicians && <p className={errorText}>{errors.technicians}</p>}
                  </div>
                </section>

                <section
                  className="rounded-xl border bg-white shadow-sm"
                  id="field-tipo"
                  onBlurCapture={(e) => {
                    const next = e.relatedTarget as Node | null;
                    if (next && (e.currentTarget as HTMLElement).contains(next)) return;
                    runBlurValidation("tipo");
                    runBlurValidation("servicios");
                  }}
                >
                  <header className="border-b px-4 py-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-800">Detalles del servicio</div>
                    <div className="text-xs text-gray-500">Tipo, servicios, descripción e imágenes</div>
                  </header>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-12">
                      <span className="block text-xs text-gray-700 mb-2">Tipo de servicio</span>
                      <div
                        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 ${
                          showFieldError("tipo") ? "rounded-lg p-3 border " + errorRing : ""
                        }`}
                      >
                        {serviceTypes.length === 0 ? (
                          <div className="text-xs text-gray-500">No hay tipos cargados desde la API.</div>
                        ) : (
                          serviceTypes.map((t) => (
                            <label
                              key={t.typeofserviceid}
                              className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                                tipoId === t.typeofserviceid ? "ring-2 ring-red-200 border-red-200" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name="tipo-servicio"
                                value={String(t.typeofserviceid)}
                                checked={tipoId === t.typeofserviceid}
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  setTipoId(Number.isFinite(v) ? v : null);
                                  setErrors((prev) => ({ ...prev, tipo: undefined }));
                                }}
                                onBlur={() => runBlurValidation("tipo")}
                                className="h-4 w-4"
                                disabled={saving || navigating || lookupsLoading}
                              />
                              <span className="text-sm font-medium text-gray-900">{t.label}</span>
                            </label>
                          ))
                        )}
                      </div>
                      {showFieldError("tipo") && errors.tipo && <p className={errorText}>{errors.tipo}</p>}
                    </div>

                    <div className="md:col-span-12" id="field-servicios">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div>
                          <div className="text-xs text-gray-700">Servicios</div>
                          <div className="text-xs text-gray-500">Agrega los servicios a realizar. La cantidad es 1 fija.</div>
                        </div>
                        <button
                          type="button"
                          onClick={addServiceRow}
                          className="h-8 rounded-md border bg-white px-3 text-xs hover:bg-gray-50 disabled:opacity-60"
                          disabled={!tipoId || lookupsLoading || saving || navigating || serviceOptionsForRow(tipoId, "").length === 0}
                        >
                          Añadir servicio
                        </button>
                      </div>

                      <div className={`rounded-lg border overflow-hidden bg-white ${showFieldError("servicios") ? errorRing : ""}`}>
                        <table className="w-full text-xs md:text-sm">
                          <thead className="bg-gray-50">
                            <tr className="text-gray-700">
                              <th className="px-3 py-2 text-left">Servicio</th>
                              <th className="px-3 py-2 text-right w-32">Precio</th>
                              <th className="px-3 py-2 w-10"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {servicios.map((it) => {
                              const opts = serviceOptionsForRow(it.tipoId, it.nombre);
                              const hasCurrent = it.nombre && getServicesForTipo(it.tipoId).some((o) => o.name === it.nombre);
                              const safeOpts = hasCurrent ? [{ serviceid: -1, name: it.nombre, typeofserviceid: it.tipoId } as any, ...opts] : opts;

                              return (
                                <tr key={it.id} className="border-t">
                                  <td className="px-3 py-2">
                                    <select
                                      value={it.nombre}
                                      onChange={(e) => {
                                        const n = e.target.value;
                                        patchItem<ServiceLineItem>(it.id, { nombre: n }, setServicios);
                                        if (errors.servicios) setErrors((prev) => ({ ...prev, servicios: undefined }));
                                      }}
                                      onBlur={() => runBlurValidation("servicios")}
                                      className="w-full h-9 rounded-md border px-2"
                                      disabled={lookupsLoading || saving || navigating || safeOpts.length === 0}
                                    >
                                      {safeOpts.map((opt: any, idx: number) => (
                                        <option key={`${it.id}-${opt.serviceid}-${idx}`} value={opt.name}>
                                          {opt.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>

                                  <td className="px-3 py-2 text-right">
                                    <input
                                      type="number"
                                      min={0}
                                      step={1000}
                                      value={it.precio}
                                      onChange={(e) => {
                                        const n = Number(e.target.value || 0);
                                        patchItem<ServiceLineItem>(
                                          it.id,
                                          { precio: Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0 },
                                          setServicios
                                        );
                                        if (errors.servicios) setErrors((prev) => ({ ...prev, servicios: undefined }));
                                      }}
                                      onBlur={() => runBlurValidation("servicios")}
                                      className="h-9 w-32 rounded-md border px-2 text-right"
                                      disabled={lookupsLoading || saving || navigating}
                                    />
                                  </td>

                                  <td className="px-3 py-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        removeItem<ServiceLineItem>(it.id, setServicios);
                                        setErrors((p) => ({ ...p, servicios: undefined }));
                                      }}
                                      className="h-9 w-9 rounded-md hover:bg-gray-100"
                                      disabled={lookupsLoading || saving || navigating}
                                      aria-label="Quitar servicio"
                                      title="Quitar"
                                    >
                                      ✕
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}

                            {servicios.length === 0 && (
                              <tr>
                                <td colSpan={3} className="px-3 py-6 text-center text-gray-500">
                                  {tipoId ? "Aún no has añadido servicios." : "Selecciona primero el tipo de servicio."}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {showFieldError("servicios") && errors.servicios && <p className={errorText}>{errors.servicios}</p>}
                    </div>

                    <div className="md:col-span-12">
                      <label className="block text-xs text-gray-700 mb-1" htmlFor="field-desc">
                        Descripción
                      </label>
                      <textarea
                        id="field-desc"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                        placeholder="Describe el servicio, alcance, observaciones, etc."
                        disabled={saving || navigating}
                      />
                    </div>

                    <div className="md:col-span-12" id="field-files">
                      <div className="flex items-center justify-between gap-2">
                        <label className="block text-xs text-gray-700">Imágenes del servicio</label>
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="h-8 px-3 rounded-md border bg-white text-xs hover:bg-gray-50 disabled:opacity-60"
                          title="Subir imágenes"
                          disabled={lookupsLoading || saving || navigating}
                        >
                          Subir imágenes
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                      </div>

                      <div className="mt-1 text-xs text-gray-500">{files.length ? `${files.length} seleccionadas` : "Ninguna seleccionada"}</div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {files.length === 0 ? (
                          <div className="text-xs text-gray-500">No hay imágenes aún.</div>
                        ) : (
                          files.map((f, idx) => (
                            <div key={`${f.name}_${f.lastModified}_${idx}`} className="relative w-20 h-20 rounded-lg overflow-hidden border bg-white">
                              <img src={previews[idx]} alt={f.name} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeFile(f)}
                                className="absolute top-1 right-1 bg-white/90 hover:bg-white text-xs rounded-full px-1"
                                aria-label="Quitar imagen"
                                title="Quitar"
                                disabled={lookupsLoading || saving || navigating}
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <section
                  className="rounded-xl border bg-white shadow-sm"
                  id="field-materiales"
                  onBlurCapture={(e) => {
                    const next = e.relatedTarget as Node | null;
                    if (next && (e.currentTarget as HTMLElement).contains(next)) return;
                    runBlurValidation("materiales");
                  }}
                >
                  <header className="border-b px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Productos (Materiales)</div>
                      <div className="text-xs text-gray-500">Agrega los materiales consumidos. Puedes ajustar la cantidad.</div>
                    </div>
                    <div className="text-xs text-gray-500">Subtotal: {formatCOP(subtotalMateriales)}</div>
                  </header>

                  <div className="p-4">
                    <div className={`rounded-lg border overflow-hidden bg-white ${showFieldError("materiales") ? errorRing : ""}`}>
                      <table className="w-full text-xs md:text-sm">
                        <thead className="bg-gray-50">
                          <tr className="text-gray-700">
                            <th className="px-3 py-2 text-left">Producto</th>
                            <th className="px-3 py-2 text-center w-24">Cantidad</th>
                            <th className="px-3 py-2 text-right w-32">Precio</th>
                            <th className="px-3 py-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {materiales.map((m) => (
                            <tr key={m.id} className="border-t">
                              <td className="px-3 py-2">
                                <select
                                  value={m.nombre}
                                  onChange={(e) => {
                                    const n = e.target.value;
                                    patchItem<MaterialLineItem>(
                                      m.id,
                                      { nombre: n, precio: precioMaterialPorNombre(n) },
                                      setMateriales
                                    );
                                    if (errors.materiales) setErrors((prev) => ({ ...prev, materiales: undefined }));
                                  }}
                                  onBlur={() => runBlurValidation("materiales")}
                                  className="w-full h-9 rounded-md border px-2"
                                  disabled={!productsCatalog.length || lookupsLoading || saving || navigating}
                                >
                                  {materialOptionsForRow(m.nombre).map((opt) => (
                                    <option key={opt.productid} value={opt.productname}>
                                      {opt.productname}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  min={1}
                                  step={1}
                                  value={m.cantidad}
                                  onChange={(e) => {
                                    const n = Number(e.target.value || 1);
                                    patchItem<MaterialLineItem>(
                                      m.id,
                                      { cantidad: Number.isFinite(n) ? Math.max(1, Math.round(n)) : 1 },
                                      setMateriales
                                    );
                                    if (errors.materiales) setErrors((prev) => ({ ...prev, materiales: undefined }));
                                  }}
                                  onBlur={() => runBlurValidation("materiales")}
                                  className="h-9 w-20 rounded-md border px-2 text-center"
                                  disabled={lookupsLoading || saving || navigating}
                                />
                              </td>

                              <td className="px-3 py-2 text-right font-medium">{formatCOP(m.precio)}</td>

                              <td className="px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    removeItem<MaterialLineItem>(m.id, setMateriales);
                                    setErrors((p) => ({ ...p, materiales: undefined }));
                                  }}
                                  className="h-9 w-9 rounded-md hover:bg-gray-100"
                                  disabled={lookupsLoading || saving || navigating}
                                  aria-label="Quitar producto"
                                  title="Quitar"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}

                          {materiales.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                                Aún no has añadido productos.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {showFieldError("materiales") && errors.materiales && <p className={errorText}>{errors.materiales}</p>}

                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={addMaterialRow}
                        className="w-full h-10 rounded-md bg-gray-100 border hover:bg-gray-50 text-sm disabled:opacity-60"
                        disabled={!availableProducts.length || lookupsLoading || saving || navigating}
                        title={!availableProducts.length ? "Ya agregaste todos los productos disponibles." : undefined}
                      >
                        Añadir producto
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border bg-white shadow-sm" id="field-viaticos">
                  <header className="border-b px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Viáticos</div>
                      <div className="text-xs text-gray-500">Afecta base e IVA.</div>
                    </div>
                  </header>
                  <div className="p-4 space-y-2">
                    <label className="block text-xs text-gray-700" htmlFor="field-viaticos-input">
                      Valor (COP)
                    </label>
                    <input
                      id="field-viaticos-input"
                      type="number"
                      min={0}
                      step={1000}
                      value={viaticosInput}
                      onChange={(e) => {
                        setViaticosInput(e.target.value);
                        if (errors.viaticos) setErrors((p) => ({ ...p, viaticos: undefined }));
                      }}
                      onBlur={() => runBlurValidation("viaticos")}
                      className={`${inputBase} text-right ${showFieldError("viaticos") ? errorRing : ""}`}
                      disabled={lookupsLoading || saving || navigating}
                      aria-invalid={showFieldError("viaticos")}
                      placeholder="0"
                    />
                    {showFieldError("viaticos") && errors.viaticos && <p className={errorText}>{errors.viaticos}</p>}
                    <div className="pt-3 border-t text-sm flex justify-between">
                      <span className="text-gray-600">Total viáticos</span>
                      <span className="font-medium">{formatCOP(Number.isFinite(viaticosValue) ? viaticosValue : 0)}</span>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border bg-white shadow-sm">
                  <header className="border-b px-4 py-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-800">Totales</div>
                    <div className="text-xs text-gray-500">Estimación</div>
                  </header>

                  <div className="p-4 space-y-3 text-sm">
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal servicios</span>
                        <span className="font-medium">{formatCOP(subtotalServicios)}</span>
                      </div>
                      {serviciosMiniLista.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-gray-600">
                          {serviciosMiniLista.map((s) => (
                            <li key={s.nombre} className="flex justify-between gap-2">
                              <span className="truncate">
                                {s.nombre} × {s.cantidad}
                              </span>
                              <span>{formatCOP(s.total)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal productos</span>
                        <span className="font-medium">{formatCOP(subtotalMateriales)}</span>
                      </div>
                      {materialesMiniLista.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-gray-600">
                          {materialesMiniLista.map((m) => (
                            <li key={m.nombre} className="flex justify-between gap-2">
                              <span className="truncate">
                                {m.nombre} × {m.cantidad}
                              </span>
                              <span>{formatCOP(m.total)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Viáticos</span>
                      <span className="font-medium">{formatCOP(Number.isFinite(viaticosValue) ? viaticosValue : 0)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">IVA ({IVA_PCT}%)</span>
                      <span className="font-medium">{formatCOP(impuestos)}</span>
                    </div>

                    <div className="flex justify-between text-base font-semibold pt-3 border-t">
                      <span>Total (estimado)</span>
                      <span>{formatCOP(totalPagar)}</span>
                    </div>
                  </div>
                </section>
              </aside>
            </form>
          </div>
        </main>

        <StickyFooter />
      </div>
    </RequireAuth>
  );
}
