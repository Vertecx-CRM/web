"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import RequireAuth from "@/features/auth/requireauth";
import { DataTable } from "@/features/dashboard/components/datatable/DataTable";
import { Column } from "@/features/dashboard/components/datatable/types/column.types";

const ICONS = {
  calendar: "/icons/calendar.svg",
  cancel: "/icons/minus-circle.svg",
  print: "/icons/printer.svg",
};

type RowTipo = "Instalación" | "Mantenimiento";
type LineItem = { nombre: string; cantidad: number; precio?: number };

type Row = {
  id: number;
  cliente: string;
  tecnico: string;
  tipo: RowTipo | string;
  fechaProgramada: string;
  estado: "Aprobada" | "Anulada" | "Pendiente" | "Garantia";
  monto?: number;
  descripcion?: string;
  servicios?: LineItem[];
  materiales?: LineItem[];
};

function formatCOP(n?: number) {
  if (n == null) return "—";
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

const MOCK: Row[] = [
  {
    id: 1,
    cliente: "InnovaTech S.A.S.",
    tecnico: "Carlos Gómez",
    tipo: "Mantenimiento",
    fechaProgramada: "11/06/2025",
    estado: "Aprobada",
    monto: 650000,
    descripcion: "Mantenimiento trimestral de red y CCTV.",
    servicios: [
      { nombre: "Mantenimiento preventivo de red", cantidad: 1, precio: 190000 },
      { nombre: "Mantenimiento de cámara", cantidad: 2, precio: 120000 },
    ],
    materiales: [
      { nombre: "Cable UTP", cantidad: 30, precio: 2500 },
      { nombre: "Conector RJ45", cantidad: 10, precio: 600 },
    ],
  },
  {
    id: 2,
    cliente: "Hotel Mirador del Río",
    tecnico: "Laura Pérez",
    tipo: "Instalación",
    fechaProgramada: "12/06/2025",
    estado: "Pendiente",
    monto: 2100000,
    descripcion: "Instalación de puntos de red y configuración de impresora.",
    servicios: [
      { nombre: "Instalación de CCTV", cantidad: 1, precio: 450000 },
      { nombre: "Cableado estructurado", cantidad: 1, precio: 280000 },
      { nombre: "Instalación impresora de red", cantidad: 1, precio: 220000 },
    ],
    materiales: [
      { nombre: "Cámara Dome 5MP", cantidad: 4, precio: 260000 },
      { nombre: "Cable UTP", cantidad: 100, precio: 2500 },
      { nombre: "Ducto 40mm", cantidad: 10, precio: 12000 },
    ],
  },
  {
    id: 3,
    cliente: "Distribuciones Antioquia",
    tecnico: "Andrés Rojas",
    tipo: "Mantenimiento",
    fechaProgramada: "13/06/2025",
    estado: "Anulada",
    monto: 420000,
    descripcion: "Revisión de servidor contabilidad.",
    servicios: [{ nombre: "Mantenimiento de servidor", cantidad: 1, precio: 350000 }],
    materiales: [{ nombre: "Patch Panel", cantidad: 1, precio: 180000 }],
  },
  {
    id: 4,
    cliente: "Café La Montaña",
    tecnico: "Mónica Silva",
    tipo: "Instalación",
    fechaProgramada: "14/06/2025",
    estado: "Aprobada",
    monto: 780000,
    descripcion: "Montaje de 2 cámaras y rack.",
    servicios: [{ nombre: "Instalación de CCTV", cantidad: 1, precio: 450000 }],
    materiales: [
      { nombre: "Cámara Dome 5MP", cantidad: 2, precio: 260000 },
      { nombre: "Rack 12U", cantidad: 1, precio: 540000 },
    ],
  },
  {
    id: 5,
    cliente: "Clínica San Rafael",
    tecnico: "Julián Ortiz",
    tipo: "Instalación",
    fechaProgramada: "15/06/2025",
    estado: "Garantia",
    monto: 0,
    descripcion: "Reinstalación de switch en garantía.",
    servicios: [{ nombre: "Instalación impresora de red", cantidad: 1, precio: 220000 }],
    materiales: [{ nombre: "Switch 8p", cantidad: 1, precio: 220000 }],
  },
  {
    id: 6,
    cliente: "Universidad Central",
    tecnico: "Sofía Herrera",
    tipo: "Mantenimiento",
    fechaProgramada: "16/06/2025",
    estado: "Aprobada",
    monto: 520000,
    descripcion: "Mantenimiento de cámaras y limpieza general.",
    servicios: [
      { nombre: "Mantenimiento de cámara", cantidad: 2, precio: 120000 },
      { nombre: "Mantenimiento preventivo de red", cantidad: 1, precio: 190000 },
    ],
    materiales: [{ nombre: "Cable UTP", cantidad: 50, precio: 2500 }],
  },
];

function EstadoPill({ v }: { v: Row["estado"] }) {
  const STYLE: Record<Row["estado"], string> = { Aprobada: "text-green-700", Pendiente: "text-yellow-700", Anulada: "text-red-700", Garantia: "text-blue-700" };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STYLE[v]}`}>{v}</span>;
}

export default function OrdersServicesIndexPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<Row[]>(MOCK);

  useEffect(() => {
    const no = searchParams.get("newOrder");
    if (!no) return;
    try {
      const payload = JSON.parse(decodeURIComponent(no)) as Omit<Row, "id" | "estado" | "fechaProgramada"> & { fechaProgramada?: string };
      setRows((prev) => {
        const nextId = prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1;
        const d = new Date();
        const fecha = payload.fechaProgramada || `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        const newRow: Row = {
          id: nextId,
          cliente: payload.cliente,
          tecnico: payload.tecnico,
          tipo: payload.tipo,
          fechaProgramada: fecha,
          estado: "Pendiente",
          monto: payload.monto,
          descripcion: payload.descripcion,
          servicios: payload.servicios,
          materiales: payload.materiales,
        };
        return [...prev, newRow];
      });
      Swal.fire({ icon: "success", title: "Orden creada", timer: 1400, showConfirmButton: false });
    } catch {}
    window.history.replaceState(null, "", pathname);
  }, [searchParams, pathname]);

  useEffect(() => {
    const eo = searchParams.get("editOrder");
    if (!eo) return;
    try {
      const p = JSON.parse(decodeURIComponent(eo)) as Partial<Row> & { id: number };
      setRows((prev) =>
        prev.map((r) =>
          r.id === p.id
            ? {
                ...r,
                cliente: p.cliente ?? r.cliente,
                tecnico: p.tecnico ?? r.tecnico,
                tipo: (p.tipo as RowTipo) ?? r.tipo,
                fechaProgramada: p.fechaProgramada ?? r.fechaProgramada,
                monto: p.monto ?? r.monto,
                descripcion: p.descripcion ?? r.descripcion,
                servicios: p.servicios ?? r.servicios,
                materiales: p.materiales ?? r.materiales,
              }
            : r
        )
      );
      Swal.fire({ icon: "success", title: "Orden actualizada", timer: 1400, showConfirmButton: false });
    } catch {}
    window.history.replaceState(null, "", pathname);
  }, [searchParams, pathname]);

  async function setDate(row: Row) {
    const { value, isConfirmed } = await Swal.fire({
      title: `Fecha para #${row.id}`,
      input: "text",
      inputLabel: "DD/MM/AAAA",
      inputValue: row.fechaProgramada,
      inputAttributes: { placeholder: "DD/MM/AAAA" },
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      preConfirm: (val) => {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val || "")) Swal.showValidationMessage("Formato inválido");
        return val;
      },
    });
    if (!isConfirmed || !value) return;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, fechaProgramada: value } : r)));
  }

  async function cancelRow(row: Row) {
    if (row.estado === "Anulada") return;
    const res = await Swal.fire({
      title: "¿Anular orden?",
      text: `Se anulará la orden #${row.id}.`,
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
    await Swal.fire({ icon: "success", title: "Anulada", text: "La orden fue anulada correctamente.", timer: 1500, showConfirmButton: false });
  }

  function printRow(row: Row) {
    const IVA_PCT = 19;
    const servicios = row.servicios ?? [];
    const materiales = row.materiales ?? [];
    const subServ = servicios.reduce((a, s) => a + (Number(s.cantidad) || 0) * (Number(s.precio) || 0), 0);
    const subMat = materiales.reduce((a, m) => a + (Number(m.cantidad) || 0) * (Number(m.precio) || 0), 0);
    const subtotal = subServ + subMat;
    const iva = Math.max(0, Math.round((subtotal * IVA_PCT) / 100));
    const total = Math.max(0, Math.round(subtotal + iva));
    const serviciosRows =
      servicios.length === 0
        ? `<tr><td colspan="4" class="empty">—</td></tr>`
        : servicios
            .map(
              (s) => `<tr>
  <td>${s.nombre}</td>
  <td class="num">${s.cantidad}</td>
  <td class="num">${formatCOP(s.precio)}</td>
  <td class="num">${formatCOP((Number(s.cantidad) || 0) * (Number(s.precio) || 0))}</td>
</tr>`
            )
            .join("");
    const materialesRows =
      materiales.length === 0
        ? `<tr><td colspan="4" class="empty">—</td></tr>`
        : materiales
            .map(
              (m) => `<tr>
  <td>${m.nombre}</td>
  <td class="num">${m.cantidad}</td>
  <td class="num">${formatCOP(m.precio)}</td>
  <td class="num">${formatCOP((Number(m.cantidad) || 0) * (Number(m.precio) || 0))}</td>
</tr>`
            )
            .join("");
    const html = `<!doctype html><html lang="es"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Orden #${row.id}</title>
<style>
:root{color-scheme:light}
body{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans";margin:24px;color:#111827}
.h{font-size:20px;font-weight:700;margin:0 0 12px 0}
.card{border:1px solid #e5e7eb;border-radius:12px;padding:20px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px}
.item{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px}
.label{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:4px}
.val{font-size:14px}
.section{margin-top:18px}
.table{width:100%;border-collapse:collapse;font-size:13px}
.table th,.table td{border-top:1px solid #e5e7eb;padding:8px}
.table th{background:#f3f4f6;text-align:left;font-weight:600}
.table td.num{text-align:right}
.empty{color:#6b7280;text-align:center;padding:10px}
.tot{width:100%;margin-top:12px}
.tot .row{display:flex;justify-content:space-between;padding:6px 0}
.tot .row.b{border-top:1px solid #e5e7eb;margin-top:6px;padding-top:10px;font-weight:700}
.footer{margin-top:16px;font-size:12px;color:#6b7280}
@media print{@page{size:A4;margin:16mm}body{margin:0}}
</style>
</head><body>
<div class="card">
  <div class="h">Orden #${row.id}</div>
  <div class="grid">
    <div class="item"><div class="label">Estado</div><div class="val">${row.estado}</div></div>
    <div class="item"><div class="label">Fecha</div><div class="val">${row.fechaProgramada}</div></div>
    <div class="item"><div class="label">Cliente</div><div class="val">${row.cliente}</div></div>
    <div class="item"><div class="label">Técnico</div><div class="val">${row.tecnico}</div></div>
    <div class="item" style="grid-column:1 / -1"><div class="label">Tipo</div><div class="val">${row.tipo}</div></div>
    ${
      row.descripcion
        ? `<div class="item" style="grid-column:1 / -1"><div class="label">Descripción</div><div class="val">${row.descripcion}</div></div>`
        : ""
    }
  </div>
  <div class="section">
    <div class="label" style="margin-bottom:6px">Servicios</div>
    <table class="table">
      <thead><tr><th>Servicio</th><th>Cant.</th><th>Precio</th><th>Importe</th></tr></thead>
      <tbody>${serviciosRows}</tbody>
    </table>
  </div>
  <div class="section">
    <div class="label" style="margin-bottom:6px">Materiales</div>
    <table class="table">
      <thead><tr><th>Material</th><th>Cant.</th><th>Precio</th><th>Importe</th></tr></thead>
      <tbody>${materialesRows}</tbody>
    </table>
  </div>
  <div class="section">
    <div class="label" style="margin-bottom:6px">Totales</div>
    <div class="tot">
      <div class="row"><span>Subtotal servicios</span><span>${formatCOP(subServ)}</span></div>
      <div class="row"><span>Subtotal materiales</span><span>${formatCOP(subMat)}</span></div>
      <div class="row"><span>IVA (19%)</span><span>${formatCOP(iva)}</span></div>
      <div class="row b"><span>Total</span><span>${formatCOP(total)}</span></div>
    </div>
  </div>
  <div class="footer">Código: OS-${String(row.id).padStart(6, "0")}</div>
</div>
</body></html>`;
    const iframe: HTMLIFrameElement = document.createElement("iframe");
    Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });
    iframe.onload = () => {
      setTimeout(() => {
        const win = iframe.contentWindow;
        win?.focus?.();
        win?.print?.();
        setTimeout(() => document.body.removeChild(iframe), 100);
      }, 50);
    };
    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  }

  function openCreate() {
    router.push(`/dashboard/orders-services/new?returnTo=${encodeURIComponent(pathname)}`);
  }

  function openEdit(r: Row) {
    const payload = encodeURIComponent(JSON.stringify(r));
    router.push(`/dashboard/orders-services/edit?returnTo=${encodeURIComponent(pathname)}&id=${r.id}&order=${payload}`);
  }

  const columns: Column<Row>[] = [
    { key: "id", header: "ID", render: (r) => <span>#{r.id}</span> },
    { key: "cliente", header: "Cliente" },
    { key: "tecnico", header: "Técnico" },
    { key: "tipo", header: "Tipo" },
    { key: "fechaProgramada", header: "Fecha" },
    { key: "estado", header: "Estado", render: (r) => <EstadoPill v={r.estado} /> },
    { key: "monto", header: "Monto", render: (r) => <b>{formatCOP(r.monto)}</b> },
  ];

  async function downloadReport() {
    const mod = await import("exceljs");
    const ExcelJS: any = (mod as any).default ?? mod;
    const wb = new ExcelJS.Workbook();
    wb.creator = "Vertecx";
    wb.created = new Date();
    const ws = wb.addWorksheet("Órdenes de servicio");
    ws.columns = [
      { header: "Id", key: "id", width: 8 },
      { header: "Cliente", key: "cliente", width: 28 },
      { header: "Técnico", key: "tecnico", width: 22 },
      { header: "Tipo", key: "tipo", width: 16 },
      { header: "Fecha programada", key: "fechaProgramada", width: 18 },
      { header: "Estado", key: "estado", width: 14 },
      { header: "Monto (COP)", key: "monto", width: 16, style: { numFmt: '"$" #,##0' } },
    ];
    const header = ws.getRow(1);
    (header as any).font = { bold: true };
    (header as any).alignment = { vertical: "middle" };
    (header as any).height = 18;
    if (typeof (header as any).eachCell === "function") {
      (header as any).eachCell((cell: any) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E7EB" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        };
      });
    }
    rows.forEach((r) => {
      const row = ws.addRow({
        id: r.id,
        cliente: r.cliente,
        tecnico: r.tecnico,
        tipo: r.tipo,
        fechaProgramada: r.fechaProgramada,
        estado: r.estado,
        monto: r.monto ?? 0,
      });
      if (typeof (row as any).eachCell === "function") {
        (row as any).eachCell((cell: any) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFF1F5F9" } },
            left: { style: "thin", color: { argb: "FFF1F5F9" } },
            bottom: { style: "thin", color: { argb: "FFF1F5F9" } },
            right: { style: "thin", color: { argb: "FFF1F5F9" } },
          };
        });
      }
    });
    ws.autoFilter = { from: "A1", to: "G1" };
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
    a.download = "reporte_ordenes.xlsx";
    document.body.appendChild(a);
    a.click?.();
    a.remove?.();
    URL.revokeObjectURL(url);
  }

  const rightActions = (
    <div className="flex items-center gap-2">
      <button onClick={downloadReport} className="cursor-pointer inline-flex h-9 items-center rounded-md bg-[#CC0000] px-3 text-sm font-semibold text-white shadow-sm hover:opacity-90">
        Descargar Reporte
      </button>
    </div>
  );

  return (
    <RequireAuth>
      <main className="flex-1 flex flex-col bg-gray-100">
        <div className="px-4 pb-6 pt-4 max-w-7xl w-full mx-auto">
          <DataTable<Row>
            data={rows}
            columns={columns}
            pageSize={8}
            searchableKeys={["id", "cliente", "tecnico", "tipo", "fechaProgramada", "estado", "monto", "descripcion"]}
            searchPlaceholder="Buscar (id, técnico, cliente, tipo, estado, fecha, monto, descripción)"
            onCreate={openCreate}
            createButtonText="Crear Orden"
            rightActions={rightActions}
            onEdit={(r) => openEdit(r)}
            renderExtraActions={(row) => (
              <>
                <button className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60" title="Calendario" onClick={() => setDate(row)}>
                  <img src={ICONS.calendar} className="h-4 w-4" />
                </button>
                <button className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60" title="Anular" onClick={() => cancelRow(row)}>
                  <img src={ICONS.cancel} className="h-4 w-4" />
                </button>
              </>
            )}
            tailHeader="Imprimir"
            renderTail={(row) => (
              <button className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60" title="Imprimir" onClick={() => printRow(row)}>
                <img src={ICONS.print} className="h-4 w-4 mx-auto" />
              </button>
            )}
            mobileCardView
          />
        </div>
      </main>
    </RequireAuth>
  );
}
