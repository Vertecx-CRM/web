"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/features/auth/requireauth";
import { DataTable, Column } from "@/features/dashboard/components/DataTable";

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
  {
    id: 1,
    descripcion: "Instalación de 6 cámaras CCTV en bodega principal",
    tipo: "Instalación",
    fecha: "03/06/2025",
    estado: "Aprobada",
    monto: 4850000,
  },
  {
    id: 2,
    descripcion: "Mantenimiento preventivo a servidor Dell R740",
    tipo: "Mantenimiento",
    fecha: "05/06/2025",
    estado: "Pendiente",
    monto: 950000,
  },
  {
    id: 3,
    descripcion: "Configuración de firewall Fortigate 100F",
    tipo: "Configuración",
    fecha: "07/06/2025",
    estado: "Aprobada",
    monto: 2100000,
  },
  {
    id: 4,
    descripcion: "Cableado de red Cat6A en oficina tercer piso",
    tipo: "Instalación",
    fecha: "09/06/2025",
    estado: "Anulada",
    monto: 3800000,
  },
  {
    id: 5,
    descripcion: "Migración de correo corporativo a Microsoft 365",
    tipo: "Soporte",
    fecha: "10/06/2025",
    estado: "Pendiente",
    monto: 1350000,
  },
  {
    id: 6,
    descripcion: "Reemplazo de UPS 3kVA en sala de equipos",
    tipo: "Instalación",
    fecha: "11/06/2025",
    estado: "Aprobada",
    monto: 4200000,
  },
  {
    id: 7,
    descripcion: "Actualización de firmware en 8 switches Cisco",
    tipo: "Actualización",
    fecha: "12/06/2025",
    estado: "Aprobada",
    monto: 760000,
  },
  {
    id: 8,
    descripcion: "Instalación de impresora de red HP Color M479",
    tipo: "Instalación",
    fecha: "13/06/2025",
    estado: "Pendiente",
    monto: 620000,
  },
  {
    id: 9,
    descripcion: "Diagnóstico de intermitencias en red Wi-Fi",
    tipo: "Soporte",
    fecha: "14/06/2025",
    estado: "Aprobada",
    monto: 380000,
  },
  {
    id: 10,
    descripcion: "Implementación de VLAN para visitantes y QoS",
    tipo: "Configuración",
    fecha: "15/06/2025",
    estado: "Pendiente",
    monto: 1180000,
  },
];

function EstadoPill({ v }: { v: Row["estado"] }) {
  const cls =
    v === "Aprobada"
      ? "text-green-600"
      : v === "Anulada"
      ? "text-red-600"
      : "text-yellow-600";
  return <span className={`font-medium ${cls}`}>{v}</span>;
}

export default function ServiceRequestsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(MOCK);

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
    { key: "tipo", header: `Tipo de
      servicio` },
    { key: "fecha", header: `Fecha 
      creacion` },
    {
      key: "estado",
      header: "Estado",
      render: (r) => <EstadoPill v={r.estado} />,
    },
  ];

  function downloadReport() {
    const headers = [
      "Id",
      "Descripcion",
      "Tipo de servicio",
      "Fecha creacion",
      "Estado",
      "Monto",
    ];
    const lines = rows.map((r) =>
      [r.id, r.descripcion, r.tipo, r.fecha, r.estado, r.monto ?? ""]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
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

  function setDate(row: Row) {
    const val = prompt("Fecha (DD/MM/AAAA):", row.fecha);
    if (!val) return;
    const ok = /^\d{2}\/\d{2}\/\d{4}$/.test(val);
    if (!ok) return alert("Formato inválido. Usa DD/MM/AAAA.");
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, fecha: val } : r))
    );
  }

  function setAmount(row: Row) {
    const val = prompt(
      "Valor COP:",
      row.monto != null ? String(row.monto) : ""
    );
    if (val == null) return;
    const num = Number(val.replace(/[^\d.]/g, ""));
    if (!isFinite(num) || num < 0) return alert("Monto inválido.");
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, monto: Math.round(num) } : r))
    );
  }

  function cancelRow(row: Row) {
    if (row.estado === "Anulada") return;
    if (!confirm(`¿Anular solicitud #${row.id}?`)) return;
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, estado: "Anulada" } : r))
    );
  }

  function printRow() {
    window.print();
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
            onCreate={() => router.push("/dashboard/requests/new")}
            createButtonText="Crear Solicitud"
            onView={(r) => router.push(`/dashboard/requests/${r.id}`)}
            onEdit={(r) => router.push(`/dashboard/requests/${r.id}/edit`)}
            renderExtraActions={(row) => (
              <>
                <button
                  className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-orange-100/60"
                  title="Calendario"
                  onClick={() => setDate(row)}
                >
                  <img src={ICONS.calendar} className="h-4 w-4" />
                </button>

                <button
                  className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-orange-100/60"
                  title="Valor"
                  onClick={() => setAmount(row)}
                >
                  <img src={ICONS.money} className="h-4 w-4" />
                </button>

                <button
                  className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-orange-100/60"
                  title="Anular"
                  onClick={() => cancelRow(row)}
                >
                  <img src={ICONS.cancel} className="h-4 w-4" />
                </button>
              </>
            )}
            tailHeader="Imprimir"
            renderTail={() => (
              <button
                className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-orange-100/60"
                title="Imprimir"
                onClick={printRow}
              >
                <img src={ICONS.print} className="h-4 w-4 mx-auto" />
              </button>
            )}
          />
        </div>
      </main>
    </RequireAuth>
  );
}
