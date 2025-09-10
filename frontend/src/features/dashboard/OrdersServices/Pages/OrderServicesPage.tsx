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
  fechaProgramada: string;
  tipo: string;
  tecnico: string;
  estado: "Aprobada" | "Anulada" | "Pendiente";
  monto?: number;
};

const MOCK: Row[] = [
  { id: 1,  fechaProgramada: "11/06/2025", tipo: "Mantenimiento", tecnico: "Carlos Gómez",  estado: "Aprobada",  monto: 650000 },
  { id: 2,  fechaProgramada: "12/06/2025", tipo: "Instalación",  tecnico: "Laura Pérez",    estado: "Pendiente", monto: 2100000 },
  { id: 3,  fechaProgramada: "13/06/2025", tipo: "Reparación",    tecnico: "Andrés Rojas",  estado: "Anulada",   monto: 420000 },
  { id: 4,  fechaProgramada: "14/06/2025", tipo: "Configuración", tecnico: "Mónica Silva",  estado: "Aprobada",  monto: 780000 },
  { id: 5,  fechaProgramada: "15/06/2025", tipo: "Instalación",  tecnico: "Julián Ortiz",  estado: "Pendiente", monto: 3400000 },
  { id: 6,  fechaProgramada: "16/06/2025", tipo: "Mantenimiento", tecnico: "Sofía Herrera", estado: "Aprobada",  monto: 520000 },
  { id: 7,  fechaProgramada: "17/06/2025", tipo: "Auditoría",     tecnico: "Daniel Torres", estado: "Pendiente", monto: 960000 },
  { id: 8,  fechaProgramada: "18/06/2025", tipo: "Instalación",  tecnico: "Natalia Ruiz",   estado: "Aprobada",  monto: 2650000 },
  { id: 9,  fechaProgramada: "19/06/2025", tipo: "Reparación",    tecnico: "Felipe Medina", estado: "Aprobada",  monto: 380000 },
  { id: 10, fechaProgramada: "20/06/2025", tipo: "Mantenimiento", tecnico: "Paula Castillo",estado: "Pendiente", monto: 610000 }
];


function EstadoPill({ v }: { v: Row["estado"] }) {
  const cls = v === "Aprobada" ? "text-green-600" : v === "Anulada" ? "text-red-600" : "text-yellow-600";
  return <span className={`font-medium ${cls}`}>{v}</span>;
}

export default function ServiceOrdersPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(MOCK);

  const columns: Column<Row>[] = [
    { key: "id", header: "Id" },
    { key: "fechaProgramada", header: "Fecha programada" },
    { key: "tipo", header: "Tipo de servicio" },
    { key: "tecnico", header: "Tecnico" },
    { key: "estado", header: "Estado", render: (r) => <EstadoPill v={r.estado} /> },
  ];

  function downloadReport() {
    const headers = ["Id", "Fecha programada", "Tipo de servicio", "Tecnico", "Estado", "Monto"];
    const lines = rows.map((r) =>
      [r.id, r.fechaProgramada, r.tipo, r.tecnico, r.estado, r.monto ?? ""]
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

  function setDate(row: Row) {
    const val = prompt("Fecha (DD/MM/AAAA):", row.fechaProgramada);
    if (!val) return;
    const ok = /^\d{2}\/\d{2}\/\d{4}$/.test(val);
    if (!ok) return alert("Formato inválido. Usa DD/MM/AAAA.");
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, fechaProgramada: val } : r)));
  }

  function setAmount(row: Row) {
    const val = prompt("Valor COP:", row.monto != null ? String(row.monto) : "");
    if (val == null) return;
    const num = Number(val.replace(/[^\d.]/g, ""));
    if (!isFinite(num) || num < 0) return alert("Monto inválido.");
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, monto: Math.round(num) } : r)));
  }

  function cancelRow(row: Row) {
    if (row.estado === "Anulada") return;
    if (!confirm(`¿Anular orden #${row.id}?`)) return;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, estado: "Anulada" } : r)));
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
            searchableKeys={["fechaProgramada", "tipo", "tecnico", "estado"]}
            rightActions={
              <button
                onClick={downloadReport}
                className="inline-flex h-9 items-center rounded-md bg-[#CC0000] px-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Descargar Reporte
              </button>
            }
            onCreate={() => router.push("/dashboard/orders/new")}
            createButtonText="Crear Orden"
            onView={(r) => router.push(`/dashboard/orders/${r.id}`)}
            onEdit={(r) => router.push(`/dashboard/orders/${r.id}/edit`)}
            onDelete={(r) => {
              if (confirm(`¿Eliminar orden #${r.id}?`)) {
                setRows((prev) => prev.filter((x) => x.id !== r.id));
              }
            }}
            renderExtraActions={(row) => (
              <>
                <button className="hover:text-gray-900" title="Calendario" onClick={() => setDate(row)}>
                  <img src={ICONS.calendar} className="h-4 w-4" />
                </button>
                <button className="hover:text-gray-900" title="Valor" onClick={() => setAmount(row)}>
                  <img src={ICONS.money} className="h-4 w-4" />
                </button>
                <button className="hover:text-red-600" title="Anular" onClick={() => cancelRow(row)}>
                  <img src={ICONS.cancel} className="h-4 w-4" />
                </button>
              </>
            )}
            tailHeader="Imprimir"
            renderTail={() => (
              <button className="text-gray-700 hover:text-black" title="Imprimir" onClick={printRow}>
                <img src={ICONS.print} className="h-4 w-4 mx-auto" />
              </button>
            )}
          />
        </div>
      </main>
    </RequireAuth>
  );
}
