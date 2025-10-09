"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import RequireAuth from "@/features/auth/requireauth";
import { DataTable } from "@/features/dashboard/components/datatable/DataTable";
import Modal from "@/features/dashboard/components/Modal";
import { Column } from "@/features/dashboard/components/datatable/types/column.types";
import { CreateAppointmentModal } from "@/features/dashboard/appointments/components/CreateAppointmentModal/createAppointment";
import type { SlotDateTime } from "@/features/dashboard/appointments/types/typeAppointment";
import ViewRequestModal from "@/features/dashboard/requests/components/ViewRequestModal";
import EditRequestModal from "@/features/dashboard/requests/components/EditRequestModal";

const ICONS = {
  calendar: "/icons/calendar.svg",
  cancel: "/icons/minus-circle.svg",
  print: "/icons/printer.svg",
  money: "/icons/dollar-sign.svg",
};

type Row = {
  id: number;
  descripcion: string;
  tipo: string;
  servicio: string;
  cliente: string;
  direccion: string;
  fecha: string;
  estado: "Aprobada" | "Anulada" | "Pendiente";
};

const MOCK: Row[] = [
  { id: 1, descripcion: "Instalación de 6 cámaras CCTV en bodega principal", tipo: "Instalación", servicio: "CCTV", cliente: "Innova LTDA", direccion: "Cl. 30 #45-12, Medellín", fecha: "03/06/2025", estado: "Aprobada" },
  { id: 2, descripcion: "Mantenimiento preventivo a servidor Dell R740", tipo: "Mantenimiento", servicio: "Servidor", cliente: "SistemasPC", direccion: "Cra. 50 #80-21, Medellín", fecha: "05/06/2025", estado: "Pendiente" },
  { id: 3, descripcion: "Configuración de firewall Fortigate 100F", tipo: "Configuración", servicio: "Configuración", cliente: "Acme S.A.", direccion: "Av. Industriales #20-15, Medellín", fecha: "07/06/2025", estado: "Aprobada" },
  { id: 4, descripcion: "Cableado de red Cat6A en oficina tercer piso", tipo: "Instalación", servicio: "Cableado", cliente: "Vertecx", direccion: "Cl. 10 #25-33, Medellín", fecha: "09/06/2025", estado: "Anulada" },
  { id: 5, descripcion: "Migración de correo corporativo a Microsoft 365", tipo: "Soporte", servicio: "Soporte", cliente: "Cliente Demo", direccion: "Cra. 70 #45-18, Medellín", fecha: "10/06/2025", estado: "Pendiente" },
  { id: 6, descripcion: "Reemplazo de UPS 3kVA en sala de equipos", tipo: "Instalación", servicio: "Servidor", cliente: "Innova LTDA", direccion: "Cl. 52 #30-90, Medellín", fecha: "11/06/2025", estado: "Aprobada" },
  { id: 7, descripcion: "Actualización de firmware en 8 switches Cisco", tipo: "Actualización", servicio: "Red WiFi", cliente: "Acme S.A.", direccion: "Cra. 38 #12-40, Medellín", fecha: "12/06/2025", estado: "Aprobada" },
  { id: 8, descripcion: "Instalación de impresora de red HP Color M479", tipo: "Instalación", servicio: "Impresora", cliente: "Vertecx", direccion: "Cl. 44 #73-22, Medellín", fecha: "13/06/2025", estado: "Pendiente" },
  { id: 9, descripcion: "Diagnóstico de intermitencias en red Wi-Fi", tipo: "Soporte", servicio: "Red WiFi", cliente: "SistemasPC", direccion: "Cra. 43A #1-50, Medellín", fecha: "14/06/2025", estado: "Aprobada" },
  { id: 10, descripcion: "Implementación de VLAN para visitantes y QoS", tipo: "Configuración", servicio: "Configuración", cliente: "Cliente Demo", direccion: "Cl. 33 #65-08, Medellín", fecha: "15/06/2025", estado: "Pendiente" },
];

const SERVICIOS = ["Cableado", "CCTV", "Servidor", "Red WiFi", "Impresora", "Configuración", "Actualización", "Soporte"];
const CLIENTES = ["Acme S.A.", "Innova LTDA", "SistemasPC", "Vertecx", "Cliente Demo"];

function formatToday() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function parseDDMMYYYY(s: string): Date | null {
  const [dd, mm, yyyy] = s.split("/").map((n) => Number(n));
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  return isNaN(d.getTime()) ? null : d;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function dateToSlot(d: Date): SlotDateTime {
  const startH = d.getHours();
  const startM = d.getMinutes();
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), startH, startM + 60);
  return {
    dia: pad2(d.getDate()),
    mes: pad2(d.getMonth() + 1),
    año: String(d.getFullYear()),
    horaInicio: pad2(startH),
    minutoInicio: pad2(startM),
    horaFin: pad2(end.getHours()),
    minutoFin: pad2(end.getMinutes()),
  };
}

function estadoClass(v: Row["estado"]) {
  return v === "Aprobada" ? "text-green-600" : v === "Anulada" ? "text-red-600" : "text-yellow-600";
}

function nfd(s: string) {
  return (s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function normTipoToCheck(t: string): ("Mantenimiento" | "Instalacion")[] {
  const s = nfd(t);
  const arr: ("Mantenimiento" | "Instalacion")[] = [];
  if (s.includes("mantenimiento")) arr.push("Mantenimiento");
  if (s.includes("instal")) arr.push("Instalacion");
  return arr;
}

function tiposToLabel(tipos: ("Mantenimiento" | "Instalacion")[]) {
  const labels = tipos.map((t) => (t === "Instalacion" ? "Instalación" : "Mantenimiento"));
  return labels.join(" / ");
}

export default function ServiceRequestsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(MOCK);
  const [openCreate, setOpenCreate] = useState(false);
  const [tipos, setTipos] = useState<string[]>([]);
  const [servicio, setServicio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cliente, setCliente] = useState("");
  const [direccion, setDireccion] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<Record<string, string | null>>({});
  const [openAppointment, setOpenAppointment] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotDateTime | null>(null);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentRow, setCurrentRow] = useState<Row | null>(null);

  const columns: Column<Row>[] = [
    { key: "id", header: "ID" },
    { key: "cliente", header: "Cliente" },
    { key: "descripcion", header: "Descripción", render: (r) => <div className="max-w-[420px] line-clamp-2 [text-wrap:balance] break-words [hyphens:auto]">{r.descripcion}</div> },
    { key: "servicio", header: "Servicio" },
    { key: "estado", header: "Estado", render: (r) => <span className={`font-medium ${estadoClass(r.estado)}`}>{r.estado}</span> },
  ];

  async function downloadReport() {
    const mod = await import("exceljs");
    const ExcelJS: any = (mod as any).default ?? mod;
    const wb = new ExcelJS.Workbook();
    wb.creator = "Vertecx";
    wb.created = new Date();
    const ws = wb.addWorksheet("Solicitudes");
    ws.columns = [
      { header: "Id", key: "id", width: 8 },
      { header: "Cliente", key: "cliente", width: 24 },
      { header: "Descripción", key: "descripcion", width: 46 },
      { header: "Servicio", key: "servicio", width: 18 },
      { header: "Tipo", key: "tipo", width: 18 },
      { header: "Dirección", key: "direccion", width: 30 },
      { header: "Fecha", key: "fecha", width: 14 },
      { header: "Estado", key: "estado", width: 14 },
    ];
    const header = ws.getRow(1);
    (header as any).font = { bold: true };
    (header as any).alignment = { vertical: "middle" };
    (header as any).height = 18;
    if (typeof (header as any).eachCell === "function") {
      (header as any).eachCell((cell: any) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
        cell.border = { top: { style: "thin", color: { argb: "FFE5E7EB" } }, left: { style: "thin", color: { argb: "FFE5E7EB" } }, bottom: { style: "thin", color: { argb: "FFE5E7EB" } }, right: { style: "thin", color: { argb: "FFE5E7EB" } } };
      });
    }
    rows.forEach((r) => {
      const row = ws.addRow({
        id: r.id,
        cliente: r.cliente,
        descripcion: r.descripcion,
        servicio: r.servicio,
        tipo: r.tipo,
        direccion: r.direccion,
        fecha: r.fecha,
        estado: r.estado,
      });
      if (typeof (row as any).eachCell === "function") {
        (row as any).eachCell((cell: any) => {
          cell.border = { top: { style: "thin", color: { argb: "FFF1F5F9" } }, left: { style: "thin", color: { argb: "FFF1F5F9" } }, bottom: { style: "thin", color: { argb: "FFF1F5F9" } }, right: { style: "thin", color: { argb: "FFF1F5F9" } } };
          cell.alignment = { vertical: "top", wrapText: true };
        });
      }
    });
    ws.autoFilter = { from: "A1", to: "H1" };
    ws.columns.forEach((col: any) => {
      let max = col.header ? String(col.header).length : 10;
      col.eachCell?.({ includeEmpty: false }, (cell: any) => {
        max = Math.max(max, String(cell.value ?? "").length);
      });
      col.width = Math.max(col.width ?? 10, Math.min(max + 2, 60));
    });
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte_solicitudes.xlsx";
    document.body.appendChild(a);
    a.click?.();
    a.remove?.();
    URL.revokeObjectURL(url);
  }

  async function cancelRow(row: Row) {
    if (row.estado === "Anulada") return;
    const res = await Swal.fire({
      title: "¿Anular solicitud?",
      text: `Se anulará la solicitud #${row.id}. Esta acción no se puede deshacer.`,
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
    await Swal.fire({ icon: "success", title: "Anulada", text: "La solicitud fue anulada correctamente.", timer: 1600, showConfirmButton: false });
  }

  function printRequest(row: Row) {
    const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Solicitud #${row.id}</title>
<style>
  :root { color-scheme: light; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"; margin: 24px; }
  .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
  .h { font-size: 20px; font-weight: 700; margin: 0 0 12px 0; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; }
  .item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; margin-bottom: 4px; }
  .val { font-size: 14px; color: #111827; }
  .desc { white-space: pre-wrap; }
  .footer { margin-top: 16px; font-size: 12px; color: #6b7280; }
  @media print { @page { size: A4; margin: 16mm; } body { margin: 0; } }
</style>
</head>
<body>
  <div class="card">
    <div class="h">Solicitud #${row.id}</div>
    <div class="grid">
      <div class="item"><div class="label">Estado</div><div class="val">${row.estado}</div></div>
      <div class="item"><div class="label">Fecha</div><div class="val">${row.fecha}</div></div>
      <div class="item"><div class="label">Cliente</div><div class="val">${row.cliente}</div></div>
      <div class="item"><div class="label">Servicio</div><div class="val">${row.servicio}</div></div>
      <div class="item" style="grid-column: 1 / -1;"><div class="label">Dirección</div><div class="val">${row.direccion}</div></div>
    </div>
    <div class="item" style="margin-top:12px;">
      <div class="label">Tipo de servicio</div>
      <div class="val">${row.tipo || "—"}</div>
    </div>
    <div class="item" style="margin-top:12px;">
      <div class="label">Descripción</div>
      <div class="val desc">${row.descripcion || "—"}</div>
    </div>
    <div class="footer">Código: SRV-${String(row.id).padStart(6, "0")}</div>
  </div>
</body>
</html>`;
    const iframe: HTMLIFrameElement = document.createElement("iframe");
    Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus?.();
        iframe.contentWindow?.print?.();
        setTimeout(() => document.body.removeChild(iframe), 100);
      }, 50);
    };
    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  }

  function toggleTipo(t: string) {
    setTipos((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function validateCreate() {
    const e: Record<string, string | null> = {};
    e.tipos = tipos.length ? null : "Selecciona al menos un tipo.";
    e.servicio = servicio ? null : "Selecciona un servicio.";
    e.descripcion = descripcion.trim().length >= 3 ? null : "Mínimo 3 caracteres.";
    e.cliente = cliente ? null : "Selecciona un cliente.";
    e.direccion = direccion.trim().length >= 3 ? null : "Mínimo 3 caracteres.";
    setErr(e);
    return Object.values(e).every((x) => !x);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateCreate()) return;
    setSaving(true);
    setRows((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1;
      const tipoLabel = tipos.length ? tiposToLabel(tipos as any) : servicio ? servicio : "—";
      const nuevo: Row = { id: nextId, descripcion: descripcion.trim(), tipo: tipoLabel, servicio: servicio || (tipos[0] ?? "—"), cliente: cliente || "Cliente Demo", direccion: direccion.trim() || "—", fecha: formatToday(), estado: "Pendiente" };
      return [...prev, nuevo];
    });
    setSaving(false);
    setOpenCreate(false);
    setTipos([]);
    setServicio("");
    setDescripcion("");
    setCliente("");
    setDireccion("");
    setErr({});
    await Swal.fire({ icon: "success", title: "Creada", text: "La solicitud fue registrada.", timer: 1400, showConfirmButton: false });
  }

  function openAppointmentModal(row: Row) {
    const d = parseDDMMYYYY(row.fecha) ?? new Date();
    setSelectedSlot(dateToSlot(d));
    setOpenAppointment(true);
  }

  function openQuotePlaceholder(row: Row) {
    Swal.fire({
      icon: "info",
      title: "Formulario de cotización",
      html: `<div class="text-left"><p class="mb-2"><strong>Solicitud:</strong> #${row.id} — ${row.descripcion}</p><p class="mb-2"><strong>Cliente:</strong> ${row.cliente}</p><p class="mb-4"><strong>Servicio:</strong> ${row.servicio}</p><p class="text-gray-700">El formulario de cotización estará disponible próximamente.</p></div>`,
      confirmButtonText: "Entendido",
    });
  }

  function rowToRequestData(r: Row) {
    return { tipos: normTipoToCheck(r.tipo), servicio: r.servicio || "", descripcion: r.descripcion || "", cliente: r.cliente || "", direccion: r.direccion || "" };
  }

  return (
    <RequireAuth>
      <main className="flex-1 flex flex-col bg-gray-100">
        <div className="px-4 pb-6 pt-4">
          <DataTable<Row>
            data={rows}
            columns={columns}
            pageSize={5}
            searchableKeys={["id", "cliente", "descripcion", "servicio", "estado"]}
            rightActions={
              <button onClick={downloadReport} className="cursor-pointer inline-flex h-9 items-center rounded-md bg-[#CC0000] px-3 text-sm font-semibold text-white shadow-sm hover:opacity-90">
                Descargar Reporte
              </button>
            }
            onCreate={() => setOpenCreate(true)}
            createButtonText="Crear Solicitud"
            onView={(r) => {
              setCurrentRow(r);
              setOpenView(true);
            }}
            onEdit={(r) => {
              setCurrentRow(r);
              setOpenEdit(true);
            }}
            renderExtraActions={(row) => (
              <>
                <button className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60" title="Programar" onClick={() => openAppointmentModal(row)}>
                  <img src={ICONS.calendar} className="h-4 w-4" />
                </button>
                <button className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60" title="Cotizar" onClick={() => openQuotePlaceholder(row)}>
                  <img src={ICONS.money} className="h-4 w-4" />
                </button>
                <button className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60" title="Anular" onClick={() => cancelRow(row)}>
                  <img src={ICONS.cancel} className="h-4 w-4" />
                </button>
              </>
            )}
            tailHeader="Imprimir"
            renderTail={(row) => (
              <button className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60" title="Imprimir" onClick={() => printRequest(row)}>
                <img src={ICONS.print} className="h-4 w-4 mx-auto" />
              </button>
            )}
          />
          <Modal
            title="Crear solicitud"
            isOpen={openCreate}
            onClose={() => setOpenCreate(false)}
            footer={
              <>
                <button type="button" onClick={() => setOpenCreate(false)} className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" form="create-request-form" disabled={saving} className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </>
            }
          >
            <form id="create-request-form" onSubmit={handleCreateSubmit} className="grid gap-4">
              <hr className="border-gray-300" />
              <div>
                <div className="text-sm text-gray-800 mb-2">Tipo de servicio</div>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                    <input type="checkbox" checked={tipos.includes("Mantenimiento")} onChange={() => setTipos((p) => (p.includes("Mantenimiento") ? p.filter((x) => x !== "Mantenimiento") : [...p, "Mantenimiento"]))} className="h-4 w-4 rounded border-gray-300" />
                    Mantenimiento
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                    <input type="checkbox" checked={tipos.includes("Instalacion")} onChange={() => setTipos((p) => (p.includes("Instalacion") ? p.filter((x) => x !== "Instalacion") : [...p, "Instalacion"]))} className="h-4 w-4 rounded border-gray-300" />
                    Instalacion
                  </label>
                </div>
                {err.tipos && <p className="mt-1 text-xs text-red-600">{err.tipos}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Servicio</label>
                <div className="relative">
                  <select value={servicio} onChange={(e) => setServicio(e.target.value)} className="w-full appearance-none rounded-md border border-gray-300 bg-gray-100 h-10 px-3 pr-8 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40">
                    <option value="">Selecciona el servicio</option>
                    {SERVICIOS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
                </div>
                {err.servicio && <p className="mt-1 text-xs text-red-600">{err.servicio}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Descripción</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ingrese sus observaciones" rows={3} className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40" />
                {err.descripcion && <p className="mt-1 text-xs text-red-600">{err.descripcion}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Cliente</label>
                <div className="relative">
                  <select value={cliente} onChange={(e) => setCliente(e.target.value)} className="w-full appearance-none rounded-md border border-gray-300 bg-gray-100 h-10 px-3 pr-8 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40">
                    <option value="">Selecciona el cliente</option>
                    {CLIENTES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
                </div>
                {err.cliente && <p className="mt-1 text-xs text-red-600">{err.cliente}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Dirección</label>
                <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ingrese su dirección" className="w-full rounded-md border border-gray-300 bg-gray-100 h-10 px-3 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40" />
                {err.direccion && <p className="mt-1 text-xs text-red-600">{err.direccion}</p>}
              </div>
            </form>
          </Modal>
        </div>
        {openAppointment && selectedSlot && <CreateAppointmentModal isOpen={openAppointment} onClose={() => setOpenAppointment(false)} onSave={() => setOpenAppointment(false)} selectedDateTime={selectedSlot} />}
        {openView && currentRow && (
          <ViewRequestModal
            isOpen={openView}
            onClose={() => setOpenView(false)}
            data={{ ...rowToRequestData(currentRow), codigo: `SRV-${String(currentRow.id).padStart(6, "0")}`, estado: currentRow.estado, fecha: currentRow.fecha }}
          />
        )}
        {openEdit && currentRow && (
          <EditRequestModal
            isOpen={openEdit}
            onClose={() => setOpenEdit(false)}
            initial={rowToRequestData(currentRow)}
            servicios={SERVICIOS}
            clientes={CLIENTES}
            onSave={async (payload) => {
              setRows((prev) =>
                prev.map((r) =>
                  r.id === currentRow!.id
                    ? { ...r, descripcion: payload.descripcion, tipo: tiposToLabel(payload.tipos as any), servicio: payload.servicio, cliente: payload.cliente, direccion: payload.direccion }
                    : r
                )
              );
              await Swal.fire({ icon: "success", title: "Actualizada", text: "La solicitud fue actualizada.", timer: 1400, showConfirmButton: false });
            }}
          />
        )}
      </main>
    </RequireAuth>
  );
}
