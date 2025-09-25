"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import RequireAuth from "@/features/auth/requireauth";
import {
  DataTable,
  Column,
} from "@/features/dashboard/components/datatable/DataTable";

const ICONS = {
  calendar: "/icons/calendar.svg",
  money: "/icons/dollar-sign.svg",
  cancel: "/icons/minus-circle.svg",
  print: "/icons/printer.svg",
};

type Row = {
  id: number;
  descripcion: string;
  tipo: string;
  fecha: string;
  estado: "Aprobada" | "Anulada" | "Pendiente";
  monto?: number;
};

const MOCK: Row[] = [
  { id: 1, descripcion: "Instalación de 6 cámaras CCTV en bodega principal", tipo: "Instalación", fecha: "03/06/2025", estado: "Aprobada", monto: 4850000 },
  { id: 2, descripcion: "Mantenimiento preventivo a servidor Dell R740", tipo: "Mantenimiento", fecha: "05/06/2025", estado: "Pendiente", monto: 950000 },
  { id: 3, descripcion: "Configuración de firewall Fortigate 100F", tipo: "Configuración", fecha: "07/06/2025", estado: "Aprobada", monto: 2100000 },
  { id: 4, descripcion: "Cableado de red Cat6A en oficina tercer piso", tipo: "Instalación", fecha: "09/06/2025", estado: "Anulada", monto: 3800000 },
  { id: 5, descripcion: "Migración de correo corporativo a Microsoft 365", tipo: "Soporte", fecha: "10/06/2025", estado: "Pendiente", monto: 1350000 },
  { id: 6, descripcion: "Reemplazo de UPS 3kVA en sala de equipos", tipo: "Instalación", fecha: "11/06/2025", estado: "Aprobada", monto: 4200000 },
  { id: 7, descripcion: "Actualización de firmware en 8 switches Cisco", tipo: "Actualización", fecha: "12/06/2025", estado: "Aprobada", monto: 760000 },
  { id: 8, descripcion: "Instalación de impresora de red HP Color M479", tipo: "Instalación", fecha: "13/06/2025", estado: "Pendiente", monto: 620000 },
  { id: 9, descripcion: "Diagnóstico de intermitencias en red Wi-Fi", tipo: "Soporte", fecha: "14/06/2025", estado: "Aprobada", monto: 380000 },
  { id: 10, descripcion: "Implementación de VLAN para visitantes y QoS", tipo: "Configuración", fecha: "15/06/2025", estado: "Pendiente", monto: 1180000 },
];

const SERVICIOS = ["Cableado", "CCTV", "Servidor", "Red WiFi", "Impresora"];
const CLIENTES = ["Acme S.A.", "Innova LTDA", "SistemasPC", "Vertecx", "Cliente Demo"];

function EstadoPill({ v }: { v: Row["estado"] }) {
  const cls = v === "Aprobada" ? "text-green-600" : v === "Anulada" ? "text-red-600" : "text-yellow-600";
  return <span className={`font-medium ${cls}`}>{v}</span>;
}
function formatToday() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
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

  const columns: Column<Row>[] = [
    { key: "id", header: "Id" },
    {
      key: "descripcion",
      header: "Descripcion",
      render: (r) => (
        <div className="max-w-[280px] line-clamp-3 [text-wrap:balance] break-words [hyphens:auto]">
          {r.descripcion}
        </div>
      ),
    },
    { key: "tipo", header: `Tipo de\n      servicio` },
    { key: "fecha", header: `Fecha \n      creacion` },
    { key: "estado", header: "Estado", render: (r) => <EstadoPill v={r.estado} /> },
  ];

  function downloadReport() {
    const headers = ["Id", "Descripcion", "Tipo de servicio", "Fecha creacion", "Estado", "Monto"];
    const lines = rows.map((r) => [r.id, r.descripcion, r.tipo, r.fecha, r.estado, r.monto ?? ""].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte_solicitudes.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function setDate(row: Row) {
    const { value, isConfirmed } = await Swal.fire({
      title: `Fecha para #${row.id}`,
      input: "text",
      inputLabel: "Usa el formato DD/MM/AAAA",
      inputValue: row.fecha,
      inputAttributes: { placeholder: "DD/MM/AAAA" },
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
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, fecha: value } : r)));
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

  function printRow() {
    window.print();
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
      const nuevo: Row = {
        id: nextId,
        descripcion: descripcion.trim(),
        tipo: servicio || (tipos.length ? tipos.join(" / ") : "—"),
        fecha: formatToday(),
        estado: "Pendiente",
      };
      return [nuevo, ...prev];
    });
    setSaving(false);
    setOpenCreate(false);
    setTipos([]); setServicio(""); setDescripcion(""); setCliente(""); setDireccion(""); setErr({});
    await Swal.fire({ icon: "success", title: "Creada", text: "La solicitud fue registrada.", timer: 1400, showConfirmButton: false });
  }

  return (
    <RequireAuth>
      <main className="flex-1 flex flex-col bg-gray-100">
        <div className="px-4 pb-6 pt-4">
          <DataTable<Row>
            data={rows}
            columns={columns}
            pageSize={5}
            searchableKeys={["id", "descripcion", "tipo", "estado", "fecha"]}
            rightActions={
              <button
                onClick={downloadReport}
                className="cursor-pointer inline-flex h-9 items-center rounded-md bg-[#CC0000] px-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Descargar Reporte
              </button>
            }
            onCreate={() => setOpenCreate(true)}
            createButtonText="Crear Solicitud"
            onView={(r) => router.push(`/dashboard/requests/${r.id}`)}
            onEdit={(r) => router.push(`/dashboard/requests/${r.id}/edit`)}
            renderExtraActions={(row) => (
              <>
                <button className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60" title="Calendario" onClick={() => setDate(row)}>
                  <img src={ICONS.calendar} className="h-4 w-4" />
                </button>
                <button className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60" title="Valor" onClick={() => setAmount(row)}>
                  <img src={ICONS.money} className="h-4 w-4" />
                </button>
                <button className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60" title="Anular" onClick={() => cancelRow(row)}>
                  <img src={ICONS.cancel} className="h-4 w-4" />
                </button>
              </>
            )}
            tailHeader="Imprimir"
            renderTail={() => (
              <button className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60" title="Imprimir" onClick={printRow}>
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
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="create-request-form"
                  disabled={saving}
                  className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
                >
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
                    <input type="checkbox" checked={tipos.includes("Mantenimiento")} onChange={() => toggleTipo("Mantenimiento")} className="h-4 w-4 rounded border-gray-300" />
                    Mantenimiento
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                    <input type="checkbox" checked={tipos.includes("Instalacion")} onChange={() => toggleTipo("Instalacion")} className="h-4 w-4 rounded border-gray-300" />
                    Instalacion
                  </label>
                </div>
                {err.tipos && <p className="mt-1 text-xs text-red-600">{err.tipos}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Servicio</label>
                <div className="relative">
                  <select
                    value={servicio}
                    onChange={(e) => setServicio(e.target.value)}
                    className="w-full appearance-none rounded-md border border-gray-300 bg-gray-100 h-10 px-3 pr-8 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
                  >
                    <option value="">Selecciona el servicio</option>
                    {SERVICIOS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
                </div>
                {err.servicio && <p className="mt-1 text-xs text-red-600">{err.servicio}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ingrese sus observaciones"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
                />
                {err.descripcion && <p className="mt-1 text-xs text-red-600">{err.descripcion}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Cliente</label>
                <div className="relative">
                  <select
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    className="w-full appearance-none rounded-md border border-gray-300 bg-gray-100 h-10 px-3 pr-8 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
                  >
                    <option value="">Selecciona el cliente</option>
                    {CLIENTES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
                </div>
                {err.cliente && <p className="mt-1 text-xs text-red-600">{err.cliente}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Dirección</label>
                <input
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ingrese su dirección"
                  className="w-full rounded-md border border-gray-300 bg-gray-100 h-10 px-3 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
                />
                {err.direccion && <p className="mt-1 text-xs text-red-600">{err.direccion}</p>}
              </div>
            </form>
          </Modal>
        </div>
      </main>
    </RequireAuth>
  );
}
