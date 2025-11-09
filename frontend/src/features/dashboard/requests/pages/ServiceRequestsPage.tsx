"use client";
import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";
import RequireAuth from "@/features/auth/requireauth";
import { DataTable } from "@/features/dashboard/components/datatable/DataTable";
import { Column } from "@/features/dashboard/components/datatable/types/column.types";
import { useServiceRequests, useCreateServiceRequest, useUpdateServiceRequest } from "@/features/dashboard/requests/hooks/useServiceRequests";
import CreateRequestModal, { type CreateRequestPayload } from "@/features/dashboard/requests/components/CreateRequestModal";
import EditRequestModal, { type EditRequestPayload } from "@/features/dashboard/requests/components/EditRequestModal";
import ViewRequestModal from "@/features/dashboard/requests/components/ViewRequestModal";
import type { SlotDateTime } from "@/features/dashboard/appointments/types/typeAppointment";
import { CreateAppointmentModal } from "@/features/dashboard/appointments/components/CreateAppointmentModal/createAppointment";
import { useLookups } from "@/features/dashboard/requests/hooks/useLookups";

const ICONS = { calendar: "/icons/calendar.svg", cancel: "/icons/minus-circle.svg", print: "/icons/printer.svg", money: "/icons/dollar-sign.svg" };

type Row = {
  id: number | string;
  descripcion: string;
  tipo: string;
  tipos: ("Mantenimiento" | "Instalacion")[];
  servicio: string;
  serviceId?: number | string;
  cliente: string;
  clienteId?: number | string;
  direccion: string;
  fecha: string;
  estado: string;
  stateId?: number | string;
  programada?: string | null;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function dateToSlot(d: Date): SlotDateTime {
  const startH = d.getHours();
  const startM = d.getMinutes();
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), startH, startM + 60);
  return { dia: pad2(d.getDate()), mes: pad2(d.getMonth() + 1), año: String(d.getFullYear()), horaInicio: pad2(startH), minutoInicio: pad2(startM), horaFin: pad2(end.getHours()), minutoFin: pad2(end.getMinutes()) };
}
function estadoClass(v: string) {
  const s = (v || "").toLowerCase();
  if (s.includes("aprob")) return "text-green-600";
  if (s.includes("anul") || s.includes("cancel")) return "text-red-600";
  if (s.includes("pend")) return "text-yellow-600";
  if (s.includes("activo")) return "text-green-600";
  return "text-gray-700";
}
function parseMaybeId(s: string) {
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
function tipoToBackend(t: "Mantenimiento" | "Instalacion" | undefined) {
  if (!t) return "MANTENIMIENTO";
  return t.toUpperCase();
}
function toYMD(input?: string | null) {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export default function ServiceRequestsPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [openAppointment, setOpenAppointment] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotDateTime | null>(null);

  const queryClient = useQueryClient();
  const { serviceOptions, customerOptions } = useLookups();
  const { data, isLoading, error } = useServiceRequests();
  const createMut = useCreateServiceRequest();
  const updateMut = useUpdateServiceRequest();

  const rows: Row[] = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return list.map((r: any) => {
      const id = r?.serviceRequestId ?? r?.id ?? "";
      const servicio = r?.service?.name ?? r?.serviceType ?? "";
      const serviceId = r?.service?.serviceid ?? r?.serviceId ?? r?.service?.id ?? undefined;
      const clienteId = r?.clientId ?? r?.customer?.customerid ?? r?.customer?.id ?? "";
      const nombre = r?.customer?.users?.name ?? r?.customer?.name ?? "";
      const apellido = r?.customer?.users?.lastname ?? r?.customer?.lastname ?? "";
      const cliente = [nombre, apellido].filter(Boolean).join(" ");
      const descripcion = r?.description ?? "";
      const direccion = r?.customer?.customercity ?? r?.address ?? "";
      const tipoRaw = r?.serviceType ?? r?.service?.category ?? "";
      const lower = String(tipoRaw).toLowerCase();
      const tipo = lower.includes("instal") ? "Instalacion" : lower.includes("manten") ? "Mantenimiento" : String(tipoRaw || "");
      const tipos: ("Mantenimiento" | "Instalacion")[] = tipo === "Mantenimiento" ? ["Mantenimiento"] : tipo === "Instalacion" ? ["Instalacion"] : [];
      const programada = r?.scheduledAt ? String(r.scheduledAt) : null;
      const estado = r?.state?.name ?? r?.status ?? "";
      const stateId = r?.stateId ?? r?.state?.stateid ?? undefined;
      const fecha = r?.createdAt ? new Date(r.createdAt).toLocaleDateString("es-CO") : "";
      return { id, descripcion: String(descripcion), tipo, tipos, servicio: String(servicio), serviceId, cliente: String(cliente), clienteId, direccion: String(direccion), fecha, estado: String(estado), stateId, programada };
    });
  }, [data]);

  const columns: Column<Row>[] = [
    { key: "id", header: "ID" },
    { key: "cliente", header: "Cliente", render: (r) => <span className="font-medium">{r.cliente}</span> },
    { key: "servicio", header: "Servicio" },
    { key: "tipo", header: "Tipo" },
    { key: "estado", header: "Estado", render: (r) => <span className={`font-medium ${estadoClass(r.estado)}`}>{r.estado}</span> },
  ];

  function optimisticPatch(id: number, patch: Partial<Row>) {
    queryClient.setQueryData<any>(["service-requests"], (old: any) => {
      if (!Array.isArray(old)) return old;
      return old.map((it: any) => {
        const itId = it?.serviceRequestId ?? it?.id;
        if (Number(itId) !== Number(id)) return it;
        const merged = { ...it, ...patch };
        if (patch.stateId !== undefined) merged.stateId = patch.stateId;
        if (patch.estado !== undefined) merged.state = { ...(it.state || {}), name: patch.estado, stateid: patch.stateId ?? it?.state?.stateid };
        if (patch.programada !== undefined) merged.scheduledAt = patch.programada;
        if (patch.descripcion !== undefined) merged.description = patch.descripcion;
        if (patch.servicio !== undefined) merged.service = { ...(it.service || {}), name: patch.servicio, serviceid: patch.serviceId ?? it?.service?.serviceid };
        return merged;
      });
    });
    setSelected((prev) => (prev && Number(prev.id) === Number(id) ? { ...prev, ...patch } : prev));
  }

  async function handleCreate(values: CreateRequestPayload) {
    const dto = {
      scheduledAt: values.programada ?? null,
      serviceType: tipoToBackend(values.tipos?.[0]),
      description: values.descripcion?.trim(),
      stateId: 1,
      serviceId: parseMaybeId(values.servicio),
      clientId: parseMaybeId(values.cliente),
    };
    await createMut.mutateAsync(dto);
    await queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    setOpenCreate(false);
    await Swal.fire({ icon: "success", title: "Creada", text: "Solicitud creada correctamente.", timer: 1400, showConfirmButton: false });
  }

  async function handleUpdate(values: EditRequestPayload) {
    if (!selected) return;
    const id = Number(selected.id);
    const payload: any = {
      scheduledAt: values.programada ?? null,
      serviceType: tipoToBackend(values.tipos?.[0]),
      description: values.descripcion?.trim(),
      serviceId: parseMaybeId(values.servicio),
      clientId: parseMaybeId(values.cliente),
    };
    const stateIdNum = values.estado ? parseMaybeId(values.estado) : 0;
    if (stateIdNum > 0) payload.stateId = stateIdNum;

    optimisticPatch(id, {
      programada: values.programada ?? null,
      descripcion: values.descripcion?.trim(),
      servicio: String(serviceOptions.find((o) => String(o.id) === String(values.servicio))?.label ?? selected.servicio),
      serviceId: parseMaybeId(values.servicio),
      cliente: selected.cliente,
      clienteId: selected.clienteId,
      estado: stateIdNum ? String((values as any).estadoLabel || "") : selected.estado,
      stateId: stateIdNum || selected.stateId,
      tipo: values.tipos?.[0] === "Instalacion" ? "Instalacion" : "Mantenimiento",
      tipos: values.tipos?.length ? values.tipos : selected.tipos,
    });

    await updateMut.mutateAsync({ id, payload });
    await queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    setOpenEdit(false);
    await Swal.fire({ icon: "success", title: "Actualizada", text: "Solicitud actualizada correctamente.", timer: 1400, showConfirmButton: false });
  }

  async function handleCancel(row: Row) {
    const res = await Swal.fire({ title: "¿Cancelar solicitud?", text: `Se marcará la solicitud #${row.id} como cancelada.`, icon: "warning", showCancelButton: true, confirmButtonText: "Sí, cancelar", cancelButtonText: "Volver", confirmButtonColor: "#d33", reverseButtons: true, focusCancel: true });
    if (!res.isConfirmed) return;
    const id = Number(row.id);
    optimisticPatch(id, { estado: "Cancelado", stateId: 4 });
    const payload = { scheduledAt: row.programada ?? null, serviceType: tipoToBackend(row.tipos?.[0]), description: row.descripcion?.trim(), stateId: 4, serviceId: parseMaybeId(String(row.serviceId ?? "")), clientId: parseMaybeId(String(row.clienteId ?? "")) };
    await updateMut.mutateAsync({ id, payload });
    await queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    await Swal.fire({ icon: "success", title: "Cancelada", text: "La solicitud fue cancelada.", timer: 1400, showConfirmButton: false });
  }

  function printRequest(row: Row) {
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Solicitud #${row.id}</title><style>:root{color-scheme:light}body{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans";margin:24px}.card{border:1px solid #e5e7eb;border-radius:12px;padding:20px}.h{font-size:20px;font-weight:700;margin:0 0 12px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px}.item{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px}.label{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:4px}.val{font-size:14px;color:#111827}.desc{white-space:pre-wrap}.footer{margin-top:16px;font-size:12px;color:#6b7280}@media print{@page{size:A4;margin:16mm}body{margin:0}}</style></head><body><div class="card"><div class="h">Solicitud #${row.id}</div><div class="grid"><div class="item"><div class="label">Estado</div><div class="val">${row.estado}</div></div><div class="item"><div class="label">Fecha</div><div class="val">${row.fecha}</div></div><div class="item"><div class="label">Cliente</div><div class="val">${row.cliente}</div></div><div class="item"><div class="label">Servicio</div><div class="val">${row.servicio}</div></div><div class="item" style="grid-column:1/-1"><div class="label">Dirección</div><div class="val">${row.direccion || "—"}</div></div></div><div class="item" style="margin-top:12px"><div class="label">Tipo de servicio</div><div class="val">${row.tipo || "—"}</div></div><div class="item" style="margin-top:12px"><div class="label">Descripción</div><div class="val desc">${row.descripcion || "—"}</div></div><div class="footer">Código: SRV-${String(row.id).padStart(6, "0")}</div></div></body></html>`;
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
      { header: "Programada", key: "programada", width: 20 },
    ];
    const header = ws.getRow(1) as any;
    header.font = { bold: true };
    header.alignment = { vertical: "middle" };
    header.height = 18;
    header.eachCell?.((cell: any) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
      cell.border = { top: { style: "thin", color: { argb: "FFE5E7EB" } }, left: { style: "thin", color: { argb: "FFE5E7EB" } }, bottom: { style: "thin", color: { argb: "FFE5E7EB" } }, right: { style: "thin", color: { argb: "FFE5E7EB" } } };
    });
    rows.forEach((r) => {
      const row = ws.addRow({ id: r.id, cliente: r.cliente, descripcion: r.descripcion, servicio: r.servicio, tipo: r.tipo, direccion: r.direccion, fecha: r.fecha, estado: r.estado, programada: r.programada ?? "" }) as any;
      row.eachCell?.((cell: any) => {
        cell.border = { top: { style: "thin", color: { argb: "FFF1F5F9" } }, left: { style: "thin", color: { argb: "FFF1F5F9" } }, bottom: { style: "thin", color: { argb: "FFF1F5F9" } }, right: { style: "thin", color: { argb: "FFF1F5F9" } } };
        cell.alignment = { vertical: "top", wrapText: true };
      });
    });
    ws.autoFilter = { from: "A1", to: "I1" } as any;
    (ws.columns as any[]).forEach((col: any) => {
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

  if (isLoading) {
    return (
      <RequireAuth>
        <main className="flex-1 flex items-center justify-center bg-gray-100 p-8">Cargando solicitudes…</main>
      </RequireAuth>
    );
  }

  if (error) {
    return (
      <RequireAuth>
        <main className="flex-1 flex items-center justify-center bg-gray-100 p-8">
          <div className="text-red-600">Error cargando solicitudes</div>
        </main>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <main className="flex-1 flex flex-col bg-gray-100">
        <DataTable<Row>
          data={rows}
          columns={columns}
          pageSize={5}
          searchableKeys={["id", "cliente", "servicio", "tipo", "estado"]}
          rightActions={
            <button onClick={downloadReport} className="cursor-pointer inline-flex h-9 items-center rounded-md bg-[#CC0000] px-3 text-sm font-semibold text-white shadow-sm hover:opacity-90">
              Descargar Reporte
            </button>
          }
          onCreate={() => setOpenCreate(true)}
          createButtonText="Crear Solicitud"
          onView={(r) => {
            setSelected(r);
            setOpenView(true);
          }}
          onEdit={(r) => {
            setSelected(r);
            setOpenEdit(true);
          }}
          renderExtraActions={(row) => (
            <>
              <button
                key={`prog-${row.id}`}
                className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60"
                title="Programar"
                onClick={() => {
                  const base = row.programada ? new Date(row.programada) : new Date();
                  setSelectedSlot(dateToSlot(base));
                  setOpenAppointment(true);
                }}
              >
                <img src={ICONS.calendar} className="h-4 w-4" />
              </button>
              <button
                key={`cot-${row.id}`}
                className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60"
                title="Cotizar"
                onClick={() => Swal.fire({ icon: "info", title: "Formulario de cotización", text: "Próximamente." })}
              >
                <img src={ICONS.money} className="h-4 w-4" />
              </button>
              <button
                key={`can-${row.id}`}
                className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60"
                title="Cancelar"
                onClick={() => handleCancel(row)}
              >
                <img src={ICONS.cancel} className="h-4 w-4" />
              </button>
            </>
          )}
          tailHeader="Imprimir"
          renderTail={(row) => (
            <button
              key={`print-${row.id}`}
              className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60"
              title="Imprimir"
              onClick={() => printRequest(row)}
            >
              <img src={ICONS.print} className="h-4 w-4 mx-auto" />
            </button>
          )}
        />

        <CreateRequestModal
          isOpen={openCreate}
          onClose={() => setOpenCreate(false)}
          onSave={handleCreate}
          title="Crear Solicitud"
          servicios={serviceOptions}
          clientes={customerOptions}
        />

        {openEdit && selected && (
          <EditRequestModal
            key={`edit-${selected.id}`}
            isOpen={openEdit}
            onClose={() => setOpenEdit(false)}
            initial={{
              tipos: selected.tipos,
              servicio: String(selected.serviceId ?? ""),
              descripcion: selected.descripcion,
              direccion: selected.direccion,
              cliente: String(selected.clienteId ?? ""),
              programada: toYMD(selected.programada),
              estado: String(selected.stateId ?? ""),
            }}
            servicios={serviceOptions}
            clientes={customerOptions}
            onSave={handleUpdate}
            title="Editar Solicitud"
          />
        )}

        {openView && selected && (
          <ViewRequestModal
            key={`view-${selected.id}`}
            isOpen={openView}
            onClose={() => setOpenView(false)}
            data={{
              tipos: selected.tipos,
              servicio: selected.servicio,
              descripcion: selected.descripcion,
              direccion: selected.direccion,
              cliente: selected.cliente,
              fecha: selected.fecha,
              estado: selected.estado,
              codigo: `SRV-${String(selected.id).padStart(6, "0")}`,
              programada: selected.programada ?? null,
            }}
            title="Detalle de la Solicitud"
          />
        )}

        {openAppointment && selectedSlot && (
          <CreateAppointmentModal
            isOpen={openAppointment}
            onClose={() => setOpenAppointment(false)}
            onSave={() => setOpenAppointment(false)}
            selectedDateTime={selectedSlot}
          />
        )}
      </main>
    </RequireAuth>
  );
}
