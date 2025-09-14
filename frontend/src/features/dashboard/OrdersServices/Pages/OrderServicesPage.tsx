"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import RequireAuth from "@/features/auth/requireauth";
import Modal from "@/features/dashboard/components/Modal";

const ICONS = {
  calendar: "/icons/calendar.svg",
  money: "/icons/dollar-sign.svg",
  cancel: "/icons/minus-circle.svg",
  print: "/icons/printer.svg",
  edit: "/icons/edit.svg",
};

type Row = {
  id: number;
  fechaProgramada: string;
  tipo: "Instalación" | "Mantenimiento";
  tecnico: string;
  cliente: string;
  estado: "Aprobada" | "Anulada" | "Pendiente";
  monto?: number;
};

const MOCK: Row[] = [
  { id: 1, fechaProgramada: "11/06/2025", tipo: "Mantenimiento", tecnico: "Carlos Gómez", cliente: "InnovaTech S.A.S.", estado: "Aprobada", monto: 650000 },
  { id: 2, fechaProgramada: "12/06/2025", tipo: "Instalación", tecnico: "Laura Pérez", cliente: "Hotel Mirador del Río", estado: "Pendiente", monto: 2100000 },
  { id: 3, fechaProgramada: "13/06/2025", tipo: "Mantenimiento", tecnico: "Andrés Rojas", cliente: "Distribuciones Antioquia", estado: "Anulada", monto: 420000 },
  { id: 4, fechaProgramada: "14/06/2025", tipo: "Instalación", tecnico: "Mónica Silva", cliente: "Café La Montaña", estado: "Aprobada", monto: 780000 },
  { id: 5, fechaProgramada: "15/06/2025", tipo: "Instalación", tecnico: "Julián Ortiz", cliente: "Clínica San Rafael", estado: "Pendiente", monto: 3400000 },
  { id: 6, fechaProgramada: "16/06/2025", tipo: "Mantenimiento", tecnico: "Sofía Herrera", cliente: "Universidad Central", estado: "Aprobada", monto: 520000 },
];

const CLIENTES = ["InnovaTech S.A.S.", "Hotel Mirador del Río", "Distribuciones Antioquia", "Café La Montaña", "Clínica San Rafael", "Universidad Central", "Cliente Demo"];
const TECNICOS = ["Carlos Gómez", "Laura Pérez", "Andrés Rojas", "Mónica Silva", "Julián Ortiz", "Sofía Herrera"];
const TIPOS: Array<Row["tipo"]> = ["Mantenimiento", "Instalación"];

type CatalogItem = { id: string; nombre: string; precio: number; tipo: Row["tipo"] };

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

const IVA_PCT = 19;

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function formatCOP(n?: number) {
  return n == null ? "—" : n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function formatPlainCOP(n?: number) {
  return n == null ? "—" : n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function pageList(totalPages: number, current: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(totalPages - 1, current + 1);
  if (left > 2) pages.push("...");
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < totalPages - 1) pages.push("...");
  pages.push(totalPages);
  return pages;
}

const gridVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const cardVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const MTR: any = motion.tr;

function InfoRow({ label, value, delay = 0 }: { label: string; value: React.ReactNode; delay?: number }) {
  return (
    <MTR initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay }}>
      <td className="px-3 py-2 text-gray-500">{label}</td>
      <td className="px-3 py-2 text-right text-gray-700 font-medium">{value}</td>
    </MTR>
  );
}

type Filter = "Todas" | Row["estado"];

const selectedFilterClasses: Record<Filter, string> = {
  Todas: "bg-gray-100 border-gray-300 text-gray-900",
  Aprobada: "bg-green-100 border-green-200 text-green-700",
  Pendiente: "bg-yellow-100 border-yellow-200 text-yellow-700",
  Anulada: "bg-red-100 border-red-200 text-red-700",
};

function today() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

type LineItem = { id: string; nombre: string; cantidad: number; precio: number };

function precioServicioPorNombre(nombre: string) {
  return SERVICIOS_DATA.find((x) => x.nombre === nombre)?.precio ?? 0;
}
function tipoServicioPorNombre(nombre: string) {
  return SERVICIOS_DATA.find((x) => x.nombre === nombre)?.tipo ?? "";
}
function precioMaterialPorNombre(nombre: string) {
  return MATERIALES_DATA.find((x) => x.nombre === nombre)?.precio ?? 0;
}

export default function ServiceOrdersCardsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(MOCK);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("Todas");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return rows.filter((r) => {
      const matchesQ = !q || norm(r.fechaProgramada).includes(q) || norm(r.tipo).includes(q) || norm(r.tecnico).includes(q) || norm(r.cliente).includes(q) || norm(r.estado).includes(q) || String(r.id).includes(q);
      const matchesF = filter === "Todas" ? true : r.estado === filter;
      return matchesQ && matchesF;
    });
  }, [rows, query, filter]);

  useEffect(() => setPage(1), [query, filter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const end = start + pageSize;
  const paged = filtered.slice(start, end);
  const pages = pageList(totalPages, current);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [cliente, setCliente] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [tipo, setTipo] = useState<Row["tipo"] | "">("");
  const [servSel, setServSel] = useState("");
  const [servQty, setServQty] = useState(1);
  const [descripcion, setDescripcion] = useState("");
  const [servicios, setServicios] = useState<LineItem[]>([]);
  const [materiales, setMateriales] = useState<LineItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  const serviciosFiltrados = useMemo(() => SERVICIOS_DATA.filter((s) => !tipo || s.tipo === tipo), [tipo]);

  const subtotalServicios = useMemo(() => servicios.reduce((a, i) => a + (Number(i.cantidad) || 0) * (Number(i.precio) || 0), 0), [servicios]);
  const subtotalMateriales = useMemo(() => materiales.reduce((a, i) => a + (Number(i.cantidad) || 0) * (Number(i.precio) || 0), 0), [materiales]);
  const subtotal = subtotalServicios + subtotalMateriales;
  const impuestos = Math.max(0, Math.round((subtotal * IVA_PCT) / 100));
  const totalPagar = Math.max(0, Math.round(subtotal + impuestos));

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

  function resetForm() {
    setCliente("");
    setTecnico("");
    setTipo("");
    setServSel("");
    setServQty(1);
    setDescripcion("");
    setServicios([]);
    setMateriales([]);
    setFiles([]);
  }

  function openCreate() {
    setEditing(null);
    resetForm();
    setOpenForm(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setCliente(row.cliente);
    setTecnico(row.tecnico);
    setTipo(row.tipo || "");
    setServSel("");
    setServQty(1);
    setDescripcion("");
    setServicios([]);
    setMateriales([]);
    setOpenForm(true);
  }

  function optionsForRow(currentName: string) {
    const base = serviciosFiltrados.slice();
    if (currentName && !base.some((s) => s.nombre === currentName)) {
      const cur = SERVICIOS_DATA.find((s) => s.nombre === currentName);
      if (cur) base.unshift(cur);
    }
    return base;
  }

  function addServicioDesdeFormulario() {
    if (!tipo || !servSel || servQty <= 0) return;
    const rec = SERVICIOS_DATA.find((s) => s.nombre === servSel && (!tipo || s.tipo === tipo));
    if (!rec) return;
    setServicios((prev) => [...prev, { id: uid(), nombre: rec.nombre, cantidad: servQty, precio: rec.precio }]);
    setServSel("");
    setServQty(1);
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

  function downloadReport() {
    const headers = ["Id", "Fecha programada", "Tipo de servicio", "Tecnico", "Cliente", "Estado", "Monto"];
    const lines = rows.map((r) => [r.id, r.fechaProgramada, r.tipo, r.tecnico, r.cliente, r.estado, r.monto ?? ""].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte_ordenes.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function setDate(row: Row) {
    const { value, isConfirmed } = await Swal.fire({
      title: `Fecha para #${row.id}`,
      input: "text",
      inputLabel: "DD/MM/AAAA",
      inputValue: row.fechaProgramada,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      preConfirm: (val) => {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val || "")) Swal.showValidationMessage("Formato inválido. Usa DD/MM/AAAA.");
        return val;
      },
    });
    if (!isConfirmed || !value) return;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, fechaProgramada: value } : r)));
  }

  async function setAmount(row: Row) {
    const { value, isConfirmed } = await Swal.fire({
      title: `Monto (COP) para #${row.id}`,
      input: "number",
      inputValue: row.monto ?? undefined,
      inputAttributes: { min: "0", step: "1" },
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      preConfirm: (val) => {
        const num = Number(val);
        if (!isFinite(num) || num < 0) Swal.showValidationMessage("Monto inválido.");
        return Math.round(num);
      },
    });
    if (!isConfirmed || value == null) return;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, monto: Number(value) } : r)));
  }

  async function cancelRow(row: Row) {
    if (row.estado === "Anulada") return;
    const res = await Swal.fire({
      title: "¿Anular orden?",
      text: `Se anulará la orden #${row.id}. Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, anular",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!res.isConfirmed) return;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, estado: "Anulada" } : r)));
    await Swal.fire({ icon: "success", title: "Anulada", text: "La orden fue anulada.", timer: 1400, showConfirmButton: false });
  }

  function printRow() {
    window.print();
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = Array.from(e.target.files || []);
    if (!fs.length) return;
    setFiles((prev) => [...prev, ...fs]);
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!cliente || !tipo || servicios.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Faltan datos",
        text: !cliente ? "Selecciona el cliente." : !tipo ? "Selecciona el tipo de servicio." : "Añade al menos un servicio.",
        timer: 1800,
        showConfirmButton: false,
      });
      return;
    }
    const tecnicoFinal = tecnico || editing?.tecnico || "";
    const baseRow: Row = editing
      ? { ...editing, cliente, tipo: tipo as Row["tipo"], tecnico: tecnicoFinal, monto: totalPagar }
      : { id: rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1, fechaProgramada: today(), tipo: tipo as Row["tipo"], tecnico: tecnicoFinal, cliente, estado: "Pendiente", monto: totalPagar };
    if (editing) setRows((prev) => prev.map((r) => (r.id === editing.id ? baseRow : r)));
    else setRows((prev) => [baseRow, ...prev]);
    setOpenForm(false);
    setEditing(null);
    resetForm();
    Swal.fire({ icon: "success", title: editing ? "Actualizada" : "Creada", text: editing ? "La orden fue actualizada." : "La orden fue creada.", timer: 1400, showConfirmButton: false });
  }

  return (
    <RequireAuth>
      <main className="flex-1 flex flex-col bg-gray-100">
        <div className="px-4 pb-6 pt-4 max-w-7xl w-full mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
            <div className="flex gap-2">
              {(["Todas", "Aprobada", "Pendiente", "Anulada"] as const).map((f) => {
                const active = filter === f;
                return (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${active ? selectedFilterClasses[f] : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"}`}>
                    {f}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar (id, técnico, cliente, tipo, estado, fecha)" className="h-9 w-full sm:w-80 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200" />
              <button onClick={openCreate} className="inline-flex h-9 items-center rounded-md bg-[#CC0000] px-3 text-sm font-semibold text-white shadow-sm hover:opacity-90">Crear Orden</button>
              <button onClick={downloadReport} className="inline-flex h-9 items-center rounded-md bg-[#CC0000] px-3 text-sm font-semibold text-white shadow-sm hover:opacity-90">Descargar Reporte</button>
            </div>
          </div>

          <motion.div variants={gridVariants} initial="hidden" animate="visible" key={`${page}-${filter}-${query}`} className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {paged.map((row) => (
                <motion.article key={row.id} variants={cardVariants} exit={{ opacity: 0, y: 8 }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-700">#{row.id}</div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{row.cliente}</h3>
                        <p className="text-xs text-gray-500">Programada: {row.fechaProgramada}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.estado === "Aprobada" ? "bg-green-100 text-green-700" : row.estado === "Pendiente" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{row.estado}</span>
                  </div>

                  <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        <InfoRow label="Técnico" value={row.tecnico} delay={0.05} />
                        <InfoRow label="Tipo de servicio" value={row.tipo} delay={0.1} />
                        <InfoRow label="Fecha" value={row.fechaProgramada} delay={0.15} />
                        <InfoRow label="Monto" value={<span className="font-semibold">{formatCOP(row.monto)}</span>} delay={0.2} />
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => openEdit(row)} className="h-7 px-2 rounded-md text-sm inline-flex items-center gap-1">
                        <img src={ICONS.edit} className="h-4 w-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} title="Calendario" onClick={() => setDate(row)} className="h-7 w-7 rounded-md flex items-center justify-center">
                        <img src={ICONS.calendar} className="h-4 w-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} title="Valor" onClick={() => setAmount(row)} className="h-7 w-7 rounded-md flex items-center justify-center">
                        <img src={ICONS.money} className="h-4 w-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} title="Anular" onClick={() => cancelRow(row)} className="h-7 w-7 rounded-md flex items-center justify-center">
                        <img src={ICONS.cancel} className="h-4 w-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} title="Imprimir" onClick={printRow} className="h-7 w-7 rounded-md flex items-center justify-center">
                        <img src={ICONS.print} className="h-4 w-4" />
                      </motion.button>
                    </div>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => router.push(`/dashboard/orders/${row.id}`)} className="inline-flex h-8 items-center rounded-md bg-[#CC0000] px-3 text-xs font-semibold text-white shadow-sm">
                      Ver Detalles
                    </motion.button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current === 1} className="h-9 px-3 rounded-md border border-gray-300 bg-white text-sm disabled:opacity-50">Anterior</motion.button>
              {pages.map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="px-2 text-sm text-gray-500">…</span>
                ) : (
                  <motion.button key={p} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage(p as number)} className={`h-9 min-w-9 px-3 rounded-md border text-sm ${current === p ? "bg-[#CC0000] border-[#CC0000] text-white" : "bg-white border-gray-300"}`}>
                    {p}
                  </motion.button>
                )
              )}
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={current === totalPages} className="h-9 px-3 rounded-md border border-gray-300 bg-white text-sm disabled:opacity-50">Siguiente</motion.button>
            </div>
          </div>
        </div>

        <Modal
          title={editing ? "Editar orden de servicio" : "Crear orden de servicio"}
          isOpen={openForm}
          onClose={() => {
            setOpenForm(false);
            setEditing(null);
          }}
          footer={
            <>
              <button type="button" onClick={() => { setOpenForm(false); setEditing(null); }} className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">Cancelar</button>
              <button type="submit" form="service-order-form" className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">Guardar</button>
            </>
          }
        >
          <form id="service-order-form" onSubmit={submitForm} className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <section className="rounded-md border bg-gray-50">
                <header className="flex items-center justify-between border-b px-3 py-2 text-sm font-semibold text-gray-700">Información del cliente</header>
                <div className="grid gap-3 p-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-700 mb-1">Cliente</label>
                    <div className="relative">
                      <select value={cliente} onChange={(e) => setCliente(e.target.value)} className="w-full appearance-none rounded-md border border-gray-300 bg-white h-9 px-3 pr-8 text-sm">
                        <option value="">Selecciona el cliente</option>
                        {CLIENTES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">▾</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-700 mb-1">Adjuntar imágenes</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => fileRef.current?.click()} className="h-9 flex-1 rounded-md border bg-white px-3 text-left text-sm">{files.length ? `${files.length} archivo(s)` : "Seleccionar archivos"}</button>
                      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-md border bg-gray-50">
                <header className="flex items-center justify-between border-b px-3 py-2 text-sm font-semibold text-gray-700">Detalles del servicio</header>
                <div className="grid gap-3 p-3 md:grid-cols-2">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Tipo de servicio</label>
                    <div className="relative">
                      <select
                        value={tipo}
                        onChange={(e) => {
                          const v = e.target.value as Row["tipo"] | "";
                          setTipo(v);
                          if (servSel && tipoServicioPorNombre(servSel) !== v) setServSel("");
                        }}
                        className="w-full appearance-none rounded-md border border-gray-300 bg-white h-9 px-3 pr-8 text-sm"
                      >
                        <option value="">Selecciona el tipo</option>
                        {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">▾</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Técnico</label>
                    <div className="relative">
                      <select
                        value={tecnico}
                        onChange={(e) => setTecnico(e.target.value)}
                        className="w-full appearance-none rounded-md border border-gray-300 bg-white h-9 px-3 pr-8 text-sm"
                      >
                        <option value="">Selecciona el técnico</option>
                        {TECNICOS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">▾</span>
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-[1.2fr_0.5fr_0.6fr_0.7fr] gap-2 items-end">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Servicio</label>
                      <div className="relative">
                        <select
                          value={servSel}
                          onChange={(e) => setServSel(e.target.value)}
                          className="w-full appearance-none rounded-md border border-gray-300 bg-white h-9 px-3 pr-8 text-sm"
                          disabled={!tipo}
                        >
                          <option value="">{tipo ? "Selecciona el servicio" : "Primero elige un tipo"}</option>
                          {serviciosFiltrados.map((s) => (
                            <option key={s.id} value={s.nombre}>
                              {s.nombre}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">▾</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Cantidad</label>
                      <input
                        type="number"
                        min={1}
                        value={servQty}
                        onChange={(e) => setServQty(Math.max(1, Number(e.target.value || 1)))}
                        className="h-9 w-full rounded-md border px-3 text-sm text-right"
                        disabled={!servSel}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Precio unitario</label>
                      <div className="h-9 w-full rounded-md border bg-gray-100 px-3 text-sm flex items-center justify-end">
                        {servSel ? formatCOP(precioServicioPorNombre(servSel)) : "—"}
                      </div>
                    </div>

                    <div className="flex">
                      <button
                        type="button"
                        onClick={addServicioDesdeFormulario}
                        disabled={!tipo || !servSel}
                        className="h-9 w-full rounded-md bg-gray-200 text-sm disabled:opacity-50"
                      >
                        Añadir servicio
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-700 mb-1">Descripción</label>
                    <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-700 mb-2">Servicios añadidos</label>
                    <div className="rounded-md border overflow-hidden">
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
                          {servicios.map((it) => {
                            const opts = optionsForRow(it.nombre);
                            return (
                              <tr key={it.id} className="border-t">
                                <td className="px-2 py-1">
                                  <select
                                    value={it.nombre}
                                    onChange={(e) => {
                                      const n = e.target.value;
                                      patchItem(it.id, { nombre: n, precio: precioServicioPorNombre(n) }, servicios, setServicios);
                                    }}
                                    className="w-full h-8 rounded-md border px-2"
                                  >
                                    {opts.map((opt) => (
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
                                    onChange={(e) => patchItem(it.id, { cantidad: Math.max(1, Number(e.target.value || 1)) }, servicios, setServicios)}
                                    className="h-8 w-16 rounded-md border px-2 text-right"
                                  />
                                </td>
                                <td className="px-2 py-1 text-right">{formatCOP(it.precio)}</td>
                                <td className="px-2 py-1 text-right">{formatCOP(it.cantidad * it.precio)}</td>
                                <td className="px-2 py-1 text-right">
                                  <button type="button" onClick={() => removeItem(it.id, servicios, setServicios)} className="h-8 px-2 rounded-md hover:bg-gray-200">✕</button>
                                </td>
                              </tr>
                            );
                          })}
                          {servicios.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-2 py-3 text-center text-gray-500">Aún no has añadido servicios.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <section className="rounded-md border bg-gray-50">
                <header className="border-b px-3 py-2 text-sm font-semibold text-gray-700">Materiales</header>
                <div className="p-3">
                  <div className="rounded-md border overflow-hidden">
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
                                onChange={(e) => patchItem(m.id, { cantidad: Math.max(1, Number(e.target.value || 1)) }, materiales, setMateriales)}
                                className="h-8 w-16 rounded-md border px-2 text-right"
                              />
                            </td>
                            <td className="px-2 py-1 text-right">{formatCOP(m.precio)}</td>
                            <td className="px-2 py-1 text-right">
                              <button type="button" onClick={() => removeItem(m.id, materiales, setMateriales)} className="h-8 px-2 rounded-md hover:bg-gray-200">✕</button>
                            </td>
                          </tr>
                        ))}
                        {materiales.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-2 py-3 text-center text-gray-500">Aún no has añadido materiales.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={addMaterialRow} className="w-full rounded-md bg-gray-200 px-3 h-9 text-sm">Añadir material</button>
                  </div>
                </div>
              </section>

              <section className="rounded-md border bg-gray-50">
                <header className="border-b px-3 py-2 text-sm font-semibold text-gray-700">Totales</header>
                <div className="p-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal servicios</span><span>{formatCOP(subtotalServicios)}</span></div>
                  <div>
                    <div className="flex justify-between"><span>Subtotal materiales</span><span>{formatCOP(subtotalMateriales)}</span></div>
                    {materialesMiniLista.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-xs text-gray-600">
                        {materialesMiniLista.map((m) => (
                          <li key={m.nombre} className="flex justify-between">
                            <span className="truncate">{m.nombre} × {m.cantidad}</span>
                            <span>{formatPlainCOP(m.total)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex justify-between"><span>IVA ({IVA_PCT}%)</span><span>{formatCOP(impuestos)}</span></div>
                  <div className="flex justify-between text-base font-semibold pt-1 border-t"><span>Total</span><span>{formatCOP(totalPagar)}</span></div>
                </div>
              </section>
            </aside>
          </form>
        </Modal>
      </main>
    </RequireAuth>
  );
}
