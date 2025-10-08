"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RequireAuth from "@/features/auth/requireauth";

type RowTipo = "Instalación" | "Mantenimiento";
type LineItem = { id: string; nombre: string; cantidad: number; precio: number };

type Cotizacion = {
  id: string;
  titulo: string;
  cliente: string;
  contacto?: string;
  tipo?: RowTipo;
  descripcion?: string;
  servicios?: Array<{ nombre: string; cantidad: number; precio?: number }>;
  materiales?: Array<{ nombre: string; cantidad: number; precio?: number }>;
};

const TIPOS: RowTipo[] = ["Mantenimiento", "Instalación"];
const IVA_PCT = 19;

type CatalogItem = { id: string; nombre: string; precio: number; tipo: RowTipo };
const SERVICIOS_DATA: CatalogItem[] = [
  { id: "srv_inst_cctv", nombre: "Instalación de CCTV", precio: 450000, tipo: "Instalación" },
  { id: "srv_cableado", nombre: "Cableado estructurado", precio: 280000, tipo: "Instalación" },
  { id: "srv_impresora", nombre: "Instalación impresora de red", precio: 220000, tipo: "Instalación" },
  { id: "srv_mant_camara", nombre: "Mantenimiento de cámara", precio: 120000, tipo: "Mantenimiento" },
  { id: "srv_mant_servidor", nombre: "Mantenimiento de servidor", precio: 350000, tipo: "Mantenimiento" },
  { id: "srv_mant_red", nombre: "Mantenimiento preventivo de red", precio: 190000, tipo: "Mantenimiento" },
];

const MATERIALES_DATA: { id: string; nombre: string; precio: number }[] = [
  { id: "mat_cable_utp", nombre: "Cable UTP", precio: 2500 },
  { id: "mat_cam_dome5", nombre: "Cámara Dome 5MP", precio: 260000 },
  { id: "mat_rj45", nombre: "Conector RJ45", precio: 600 },
  { id: "mat_ducto40", nombre: "Ducto 40mm", precio: 12000 },
  { id: "mat_switch8", nombre: "Switch 8p", precio: 220000 },
  { id: "mat_patch", nombre: "Patch Panel", precio: 180000 },
  { id: "mat_rack12", nombre: "Rack 12U", precio: 540000 },
];

const COTIZACIONES_MOCK: Cotizacion[] = [
  {
    id: "CTZ-1001",
    titulo: "Instalación 4 cámaras sede norte",
    cliente: "InnovaTech S.A.S.",
    contacto: "Andrés • 3001234567",
    tipo: "Instalación",
    descripcion: "Montaje de 4 cámaras, canalización y puesta en marcha.",
    servicios: [
      { nombre: "Instalación de CCTV", cantidad: 1 },
      { nombre: "Cableado estructurado", cantidad: 1 },
    ],
    materiales: [
      { nombre: "Cámara Dome 5MP", cantidad: 4 },
      { nombre: "Cable UTP", cantidad: 80 },
      { nombre: "Conector RJ45", cantidad: 20 },
      { nombre: "Ducto 40mm", cantidad: 8 },
      { nombre: "Patch Panel", cantidad: 1 },
      { nombre: "Rack 12U", cantidad: 1 },
    ],
  },
  {
    id: "CTZ-1002",
    titulo: "Mantenimiento preventivo red piso 3",
    cliente: "Hotel Mirador del Río",
    contacto: "María • 3017654321",
    tipo: "Mantenimiento",
    descripcion: "Mantenimiento y limpieza general de activos de red.",
    servicios: [{ nombre: "Mantenimiento preventivo de red", cantidad: 1 }],
    materiales: [{ nombre: "Switch 8p", cantidad: 1 }],
  },
  {
    id: "CTZ-1003",
    titulo: "Diagnóstico servidor contabilidad",
    cliente: "Distribuciones Antioquia",
    contacto: "Paola • 3020001111",
    tipo: "Mantenimiento",
    descripcion: "Diagnóstico y plan de actualización.",
    servicios: [{ nombre: "Mantenimiento de servidor", cantidad: 1 }],
    materiales: [],
  },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function formatCOP(n?: number) {
  return n == null ? "—" : n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

type Errors = Partial<{
  cotizacionId: string;
  tipo: string;
  servicios: string;
  materiales: string;
  files: string;
}>;

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

export default function OrderCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard/orders";

  const [cotizacionesData] = useState<Cotizacion[]>(COTIZACIONES_MOCK);
  const [cotizacionId, setCotizacionId] = useState("");
  const cotizacionSel = useMemo(() => cotizacionesData.find((c) => c.id === cotizacionId), [cotizacionId, cotizacionesData]);

  const [tipo, setTipo] = useState<RowTipo | "">("");
  const [descripcion, setDescripcion] = useState("");

  const [servSel, setServSel] = useState("");
  const [servQty, setServQty] = useState(1);
  const [servicios, setServicios] = useState<LineItem[]>([]);
  const [materiales, setMateriales] = useState<LineItem[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [errors, setErrors] = useState<Errors>({});
  const summaryRef = useRef<HTMLDivElement>(null);

  const isDesktop = useDesktopQuery();
  const sidebarW = useSidebarWidth("#app-sidebar");

  const inputBase = "w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm";
  const selectBase = `${inputBase} appearance-none pr-8`;
  const selectWrap = "relative";
  const chevron = "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2";
  const errorText = "mt-1 text-xs text-red-600";
  const errorRing = "border-red-500 ring-1 ring-red-500";

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  const serviciosFiltrados = useMemo(() => SERVICIOS_DATA.filter((s) => !tipo || s.tipo === tipo), [tipo]);

  function precioServicioPorNombre(nombre: string) {
    return SERVICIOS_DATA.find((x) => x.nombre === nombre)?.precio ?? 0;
  }
  function precioMaterialPorNombre(nombre: string) {
    return MATERIALES_DATA.find((x) => x.nombre === nombre)?.precio ?? 0;
  }

  useEffect(() => {
    if (!cotizacionSel) return;
    setTipo(cotizacionSel.tipo ?? "");
    setDescripcion(cotizacionSel.descripcion ?? "");
    const svc: LineItem[] = (cotizacionSel.servicios ?? []).map((s) => ({
      id: uid(),
      nombre: s.nombre,
      cantidad: s.cantidad,
      precio: s.precio ?? precioServicioPorNombre(s.nombre),
    }));
    const mats: LineItem[] = (cotizacionSel.materiales ?? []).map((m) => ({
      id: uid(),
      nombre: m.nombre,
      cantidad: m.cantidad,
      precio: m.precio ?? precioMaterialPorNombre(m.nombre),
    }));
    setServicios(svc);
    setMateriales(mats);
    setServSel("");
    setServQty(1);
    setErrors((prev) => ({ ...prev, cotizacionId: undefined }));
  }, [cotizacionSel]);

  const subtotalServicios = useMemo(() => servicios.reduce((a, i) => a + (Number(i.cantidad) || 0) * (Number(i.precio) || 0), 0), [servicios]);
  const subtotalMateriales = useMemo(() => materiales.reduce((a, i) => a + (Number(i.cantidad) || 0) * (Number(i.precio) || 0), 0), [materiales]);
  const subtotal = subtotalServicios + subtotalMateriales;
  const impuestos = Math.max(0, Math.round((subtotal * IVA_PCT) / 100));
  const totalPagar = Math.max(0, Math.round(subtotal + impuestos));

  const serviciosMiniLista = useMemo(() => {
    const map = new Map<string, { nombre: string; cantidad: number; total: number }>();
    servicios.forEach((s) => {
      if (!s.nombre) return;
      const t = (Number(s.cantidad) || 0) * (Number(s.precio) || 0);
      const prev = map.get(s.nombre);
      if (prev) {
        prev.cantidad += Number(s.cantidad) || 0;
        prev.total += t;
      } else {
        map.set(s.nombre, { nombre: s.nombre, cantidad: Number(s.cantidad) || 0, total: t });
      }
    });
    return Array.from(map.values());
  }, [servicios]);

  const materialesMiniLista = useMemo(() => {
    const map = new Map<string, { nombre: string; cantidad: number; total: number }>();
    materiales.forEach((m) => {
      if (!m.nombre) return;
      const t = (Number(m.cantidad) || 0) * (Number(m.precio) || 0);
      const prev = map.get(m.nombre);
      if (prev) {
        prev.cantidad += Number(m.cantidad) || 0;
        prev.total += t;
      } else {
        map.set(m.nombre, { nombre: m.nombre, cantidad: Number(m.cantidad) || 0, total: t });
      }
    });
    return Array.from(map.values());
  }, [materiales]);

  function addServicioDesdeFormulario() {
    if (!tipo || !servSel || servQty <= 0) return;
    const rec = SERVICIOS_DATA.find((s) => s.nombre === servSel && (!tipo || s.tipo === tipo));
    if (!rec) return;
    setServicios((prev) => [...prev, { id: uid(), nombre: rec.nombre, cantidad: servQty, precio: rec.precio }]);
    setServSel("");
    setServQty(1);
    setErrors((prev) => ({ ...prev, servicios: undefined }));
  }
  function addMaterialRow() {
    const first = MATERIALES_DATA[0];
    setMateriales((prev) => [...prev, { id: uid(), nombre: first.nombre, cantidad: 1, precio: first.precio }]);
  }
  function patchItem(id: string, patch: Partial<LineItem>, list: LineItem[], setList: (v: LineItem[]) => void) {
    setList(list.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function removeItem(id: string, list: LineItem[], setList: (v: LineItem[]) => void) {
    setList(list.filter((x) => x.id !== id));
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
      setErrors((prev) => ({
        ...prev,
        files: `Máximo ${MAX_FILES} imágenes. ${rechazadasTxt(rejected)}`.trim(),
      }));
    } else {
      dedupeAppend(accepteds);
      setErrors((prev) => ({
        ...prev,
        files: rechazadasTxt(rejected) || undefined,
      }));
    }
    e.currentTarget.value = "";
  }
  function rechazadasTxt(r: string[]) {
    return r.length ? `Rechazadas: ${r.join(", ")}` : "";
  }

  function removeFile(file: File) {
    setFiles((prev) => prev.filter((f) => !(f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)));
  }

  function validateForm(): Errors {
    const errs: Errors = {};
    if (!cotizacionSel) errs.cotizacionId = "Selecciona una cotización.";
    if (!tipo) errs.tipo = "Selecciona el tipo de servicio.";
    if (servicios.length === 0) errs.servicios = "Debes añadir al menos un servicio.";
    const badQtySvc = servicios.some((s) => !s.cantidad || s.cantidad < 1);
    const badQtyMat = materiales.some((m) => !m.cantidad || m.cantidad < 1);
    if (badQtySvc) errs.servicios = (errs.servicios ? errs.servicios + " " : "") + "Corrige cantidades de servicios.";
    if (badQtyMat) errs.materiales = "Corrige cantidades de materiales.";
    return errs;
  }

  function focusFirstError(er: Errors) {
    const order = ["cotizacion", "tipo", "servicios", "materiales", "files"];
    const id = order.find((k) => (er as any)[k === "cotizacion" ? "cotizacionId" : (k as keyof Errors)]);
    if (!id) return;
    const el = document.getElementById(`field-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLElement).focus?.();
    } else {
      summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const er = validateForm();
    setErrors(er);
    if (Object.keys(er).length > 0) {
      focusFirstError(er);
      return;
    }
    const payload = {
      cotizacionId,
      cliente: cotizacionSel!.cliente,
      tipo: tipo as RowTipo,
      monto: totalPagar,
      descripcion,
      servicios,
      materiales,
    };
    const url = `${returnTo}?newOrder=${encodeURIComponent(JSON.stringify(payload))}`;
    router.push(url);
  }

  return (
    <RequireAuth>
      <div className="relative" style={{ paddingLeft: isDesktop ? sidebarW : 0 }}>
        <main
          className="h-[100dvh] overflow-y-auto overscroll-y-contain bg-gray-100 pb-32 md:pb-48"
          style={{ scrollbarGutter: "stable both-edges" }}
        >
          <div className="px-4 pt-4 max-w-7xl w-full mx-auto">
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-gray-900">Crear orden de servicio</h1>
            </div>

            {Object.keys(errors).length > 0 && (
              <div ref={summaryRef} className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-800 p-3 text-sm">
                <strong className="block mb-1">Hay errores en el formulario:</strong>
                <ul className="list-disc pl-5 space-y-1">
                  {errors.cotizacionId && <li>{errors.cotizacionId}</li>}
                  {errors.tipo && <li>{errors.tipo}</li>}
                  {errors.servicios && <li>{errors.servicios}</li>}
                  {errors.materiales && <li>{errors.materiales}</li>}
                  {errors.files && <li>{errors.files}</li>}
                </ul>
              </div>
            )}

            <form id="order-form" onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-6">
                <section className="rounded-xl border bg-gray-50">
                  <header className="border-b px-4 py-3 text-sm font-semibold text-gray-700">Cotización</header>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-12">
                      <label htmlFor="field-cotizacion" className="block text-xs text-gray-700 mb-1">
                        Seleccionar cotización
                      </label>
                      <div className="flex gap-2">
                        <div className={`${selectWrap} flex-1`}>
                          <select
                            id="field-cotizacion"
                            value={cotizacionId}
                            onChange={(e) => {
                              setCotizacionId(e.target.value);
                              setErrors((prev) => ({ ...prev, cotizacionId: undefined }));
                            }}
                            className={`${selectBase} ${errors.cotizacionId ? errorRing : ""}`}
                            aria-invalid={!!errors.cotizacionId}
                          >
                            <option value="">Elige una cotización</option>
                            {cotizacionesData.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.id} — {c.titulo} ({c.cliente})
                              </option>
                            ))}
                          </select>
                          <span className={chevron}>▾</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => router.push("/dashboard/quotes/new")}
                          className="h-10 rounded-md border border-[#CC0000] text-[#CC0000] px-3 text-sm hover:bg-red-50 whitespace-nowrap"
                        >
                          Nueva cotización
                        </button>
                      </div>
                      {errors.cotizacionId && <p className={errorText}>{errors.cotizacionId}</p>}
                    </div>

                    {cotizacionSel && (
                      <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-700">
                        <div className="bg-white rounded-md border p-2">
                          <div className="font-medium">Cliente</div>
                          <div>{cotizacionSel.cliente}</div>
                        </div>
                        <div className="bg-white rounded-md border p-2">
                          <div className="font-medium">Cotización</div>
                          <div>{cotizacionSel.id}</div>
                        </div>
                        <div className="bg-white rounded-md border p-2">
                          <div className="font-medium">Contacto</div>
                          <div>{cotizacionSel.contacto || "—"}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-xl border bg-gray-50">
                  <header className="border-b px-4 py-3 text-sm font-semibold text-gray-700">Detalles del servicio</header>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6" id="field-tipo">
                      <span className="block text-xs text-gray-700 mb-1">Tipo de servicio</span>
                      <div className={`flex flex-wrap gap-2 ${errors.tipo ? "rounded-md p-2 border " + errorRing : ""}`}>
                        {TIPOS.map((t) => (
                          <label key={t} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white">
                            <input
                              type="radio"
                              name="tipo-servicio"
                              value={t}
                              checked={tipo === t}
                              onChange={(e) => {
                                const v = e.target.value as RowTipo;
                                setTipo(v);
                                setErrors((prev) => ({ ...prev, tipo: undefined }));
                                if (servSel) setServSel("");
                              }}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">{t}</span>
                          </label>
                        ))}
                      </div>
                      {errors.tipo && <p className={errorText}>{errors.tipo}</p>}
                    </div>

                    <div className="md:col-span-6"></div>

                    <div className="md:col-span-6">
                      <label className="block text-xs text-gray-700 mb-1" htmlFor="field-servicio">
                        Servicio
                      </label>
                      <div className={selectWrap}>
                        <select
                          id="field-servicio"
                          value={servSel}
                          onChange={(e) => setServSel(e.target.value)}
                          className={selectBase}
                          disabled={!tipo}
                        >
                          <option value="">{tipo ? "Selecciona el servicio" : "Primero elige un tipo"}</option>
                          {serviciosFiltrados.map((s) => (
                            <option key={s.id} value={s.nombre}>
                              {s.nombre}
                            </option>
                          ))}
                        </select>
                        <span className={chevron}>▾</span>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-700 mb-1" htmlFor="field-serv-cant">
                        Cantidad
                      </label>
                      <input
                        id="field-serv-cant"
                        type="number"
                        min={1}
                        value={servQty}
                        onChange={(e) => setServQty(Math.max(1, Number(e.target.value || 1)))}
                        className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                        disabled={!servSel}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-700 mb-1">Precio unitario</label>
                      <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 text-sm flex items-center justify-end">
                        {servSel ? formatCOP(precioServicioPorNombre(servSel)) : "—"}
                      </div>
                    </div>

                    <div className="md:col-span-2 flex items-end">
                      <button
                        type="button"
                        onClick={addServicioDesdeFormulario}
                        disabled={!tipo || !servSel}
                        className="h-10 w-full rounded-md bg-gray-200 text-sm disabled:opacity-50"
                      >
                        Añadir
                      </button>
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
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="md:col-span-12" id="field-files">
                      <label className="block text-xs text-gray-700 mb-1">Imágenes del servicio</label>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => fileRef.current?.click()} className="h-8 px-2 rounded-md border bg-white text-xs hover:bg-gray-50" title="Subir imágenes">
                          Subir imágenes
                        </button>
                        <span className="text-xs text-gray-500">{files.length ? `${files.length} seleccionadas` : "Ninguna seleccionada"}</span>
                        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                      </div>
                      {errors.files && <p className={errorText}>{errors.files}</p>}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {files.length === 0 ? (
                          <p className="text-xs text-gray-500">No hay imágenes aún.</p>
                        ) : (
                          files.map((f, idx) => (
                            <div key={`${f.name}_${f.lastModified}_${idx}`} className="relative w-20 h-20 rounded-md overflow-hidden border bg-white">
                              <img src={previews[idx]} alt={f.name} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeFile(f)} className="absolute top-1 right-1 bg-white/90 hover:bg-white text-xs rounded-full px-1" aria-label="Quitar imagen" title="Quitar">
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-12" id="field-servicios">
                      <label className="block text-xs text-gray-700 mb-2">Servicios añadidos</label>
                      <div className={`rounded-md border overflow-hidden bg-white ${errors.servicios ? errorRing : ""}`}>
                        <table className="w-full text-xs md:text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-2 py-2 text-left">Servicio</th>
                              <th className="px-2 py-2 text-right w-16">Cant.</th>
                              <th className="px-2 py-2 text-right w-28">Precio</th>
                              <th className="px-2 py-2 text-right w-28">Importe</th>
                              <th className="px-2 py-2 w-8"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {servicios.map((it) => (
                              <tr key={it.id} className="border-t">
                                <td className="px-2 py-1">
                                  <select
                                    value={it.nombre}
                                    onChange={(e) => {
                                      const n = e.target.value;
                                      const p = precioServicioPorNombre(n);
                                      patchItem(it.id, { nombre: n, precio: p }, servicios, setServicios);
                                      setErrors((prev) => ({ ...prev, servicios: undefined }));
                                    }}
                                    className="w-full h-8 rounded-md border px-2"
                                  >
                                    {(tipo ? serviciosFiltrados : SERVICIOS_DATA).map((opt) => (
                                      <option key={`${it.id}-${opt.id}`} value={opt.nombre}>
                                        {opt.nombre}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-2 py-1 text-right">
                                  <input
                                    type="number"
                                    min={1}
                                    value={it.cantidad}
                                    onChange={(e) => {
                                      patchItem(it.id, { cantidad: Math.max(1, Number(e.target.value || 1)) }, servicios, setServicios);
                                      setErrors((prev) => ({ ...prev, servicios: undefined }));
                                    }}
                                    className="h-8 w-16 rounded-md border px-2 text-right"
                                  />
                                </td>
                                <td className="px-2 py-1 text-right">{formatCOP(it.precio)}</td>
                                <td className="px-2 py-1 text-right">{formatCOP(it.cantidad * it.precio)}</td>
                                <td className="px-2 py-1 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      removeItem(it.id, servicios, setServicios);
                                      setErrors((prev) => ({ ...prev, servicios: undefined }));
                                    }}
                                    className="h-8 px-2 rounded-md hover:bg-gray-200"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {servicios.length === 0 && (
                              <tr>
                                <td colSpan={5} className="px-2 py-3 text-center text-gray-500">
                                  Aún no has añadido servicios.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      {errors.servicios && <p className={errorText}>{errors.servicios}</p>}
                    </div>
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="rounded-xl border bg-gray-50" id="field-materiales">
                  <header className="border-b px-4 py-3 text-sm font-semibold text-gray-700">Materiales</header>
                  <div className="p-4">
                    <div className={`rounded-md border overflow-hidden bg-white ${errors.materiales ? errorRing : ""}`}>
                      <table className="w-full text-xs md:text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-2 py-2 text-left">Material</th>
                            <th className="px-2 py-2 text-right w-16">Cant.</th>
                            <th className="px-2 py-2 text-right w-28">Precio</th>
                            <th className="px-2 py-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {materiales.map((m) => (
                            <tr key={m.id} className="border-t">
                              <td className="px-2 py-1">
                                <select
                                  value={m.nombre}
                                  onChange={(e) => {
                                    const n = e.target.value;
                                    patchItem(m.id, { nombre: n, precio: precioMaterialPorNombre(n) }, materiales, setMateriales);
                                    setErrors((prev) => ({ ...prev, materiales: undefined }));
                                  }}
                                  className="w-full h-8 rounded-md border px-2"
                                >
                                  {MATERIALES_DATA.map((opt) => (
                                    <option key={opt.id} value={opt.nombre}>
                                      {opt.nombre}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-2 py-1 text-right">
                                <input
                                  type="number"
                                  min={1}
                                  value={m.cantidad}
                                  onChange={(e) => {
                                    patchItem(m.id, { cantidad: Math.max(1, Number(e.target.value || 1)) }, materiales, setMateriales);
                                    setErrors((prev) => ({ ...prev, materiales: undefined }));
                                  }}
                                  className="h-8 w-16 rounded-md border px-2 text-right"
                                />
                              </td>
                              <td className="px-2 py-1 text-right">{formatCOP(m.precio)}</td>
                              <td className="px-2 py-1 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    removeItem(m.id, materiales, setMateriales);
                                    setErrors((prev) => ({ ...prev, materiales: undefined }));
                                  }}
                                  className="h-8 px-2 rounded-md hover:bg-gray-200"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                          {materiales.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-2 py-3 text-center text-gray-500">
                                Aún no has añadido materiales.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {errors.materiales && <p className={errorText}>{errors.materiales}</p>}
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={addMaterialRow} className="w-full rounded-md bg-gray-200 px-3 h-10 text-sm">
                        Añadir material
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border bg-gray-50">
                  <header className="border-b px-4 py-3 text-sm font-semibold text-gray-700">Totales</header>
                  <div className="p-4 space-y-3 text-sm">
                    <div>
                      <div className="flex justify-between">
                        <span>Subtotal servicios</span>
                        <span>{formatCOP(subtotalServicios)}</span>
                      </div>
                      {serviciosMiniLista.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-gray-600">
                          {serviciosMiniLista.map((s) => (
                            <li key={s.nombre} className="flex justify-between">
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
                        <span>Subtotal materiales</span>
                        <span>{formatCOP(subtotalMateriales)}</span>
                      </div>
                      {materialesMiniLista.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-gray-600">
                          {materialesMiniLista.map((m) => (
                            <li key={m.nombre} className="flex justify-between">
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
                      <span>IVA ({IVA_PCT}%)</span>
                      <span>{formatCOP(impuestos)}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold pt-2 border-t">
                      <span>Total</span>
                      <span>{formatCOP(totalPagar)}</span>
                    </div>
                  </div>
                </section>
              </aside>

              <div className="lg:col-span-2 flex items-center justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => router.push(returnTo)}
                  className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button type="submit" form="order-form" className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
