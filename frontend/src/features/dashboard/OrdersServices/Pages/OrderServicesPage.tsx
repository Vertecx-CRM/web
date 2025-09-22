"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import RequireAuth from "@/features/auth/requireauth";

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

function formatCOP(n?: number) {
  return n == null ? "—" : n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}
function today() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
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

export default function OrdersIndexPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<Row[]>(MOCK);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("Todas");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return rows.filter((r) => {
      const matchesQ =
        !q ||
        norm(r.fechaProgramada).includes(q) ||
        norm(r.tipo).includes(q) ||
        norm(r.tecnico).includes(q) ||
        norm(r.cliente).includes(q) ||
        norm(r.estado).includes(q) ||
        String(r.id).includes(q);
      const matchesF = filter === "Todas" ? true : r.estado === filter;
      return matchesQ && matchesF;
    });
  }, [rows, query, filter]);

  useEffect(() => setPage(1), [query, filter]);

  useEffect(() => {
    const no = searchParams.get("newOrder");
    if (!no) return;
    try {
      const payload = JSON.parse(decodeURIComponent(no)) as {
        cliente: string;
        tecnico: string;
        tipo: Row["tipo"];
        monto: number;
        fechaProgramada?: string;
      };
      setRows((prev) => {
        const nextId = prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1;
        const newRow: Row = {
          id: nextId,
          fechaProgramada: payload.fechaProgramada || today(),
          tipo: payload.tipo,
          tecnico: payload.tecnico,
          cliente: payload.cliente,
          estado: "Pendiente",
          monto: Math.round(payload.monto || 0),
        };
        return [newRow, ...prev];
      });
      Swal.fire({ icon: "success", title: "Orden creada", timer: 1400, showConfirmButton: false });
    } catch {}
    router.replace(pathname);
  }, [searchParams, pathname, router]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const end = start + pageSize;
  const paged = filtered.slice(start, end);
  const pages = pageList(totalPages, current);

  function openCreate() {
    router.push(`/dashboard/orders-services/new?returnTo=${encodeURIComponent(pathname)}`);
  }

  function openEdit(row: Row) {
    router.push(`/dashboard/orders-services/${row.id}`);
  }

  function downloadReport() {
    const headers = ["Id", "Fecha programada", "Tipo de servicio", "Tecnico", "Cliente", "Estado", "Monto"];
    const lines = rows.map((r) =>
      [r.id, r.fechaProgramada, r.tipo, r.tecnico, r.cliente, r.estado, r.monto ?? ""]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
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
      </main>
    </RequireAuth>
  );
}
