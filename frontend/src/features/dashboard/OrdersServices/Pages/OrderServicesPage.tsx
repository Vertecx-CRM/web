"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import RequireAuth from "@/features/auth/requireauth";
import { DataTable } from "@/features/dashboard/components/datatable/DataTable";
import { Column } from "../../components/datatable/types/column.types";

const ICONS = {
  calendar: "/icons/calendar.svg",
  cancel: "/icons/minus-circle.svg",
  print: "/icons/printer.svg",
};

type Row = {
  id: number;
  cliente: string;
  tecnico: string;
  tipo: "Instalación" | "Mantenimiento";
  fechaProgramada: string;
  estado: "Aprobada" | "Anulada" | "Pendiente" | "Garantia";
  monto?: number; // ✅ nuevo campo
};

const MOCK: Row[] = [
  { id: 1, cliente: "InnovaTech S.A.S.",       tecnico: "Carlos Gómez",  tipo: "Mantenimiento", fechaProgramada: "11/06/2025", estado: "Aprobada",  monto: 650000  },
  { id: 2, cliente: "Hotel Mirador del Río",    tecnico: "Laura Pérez",   tipo: "Instalación",  fechaProgramada: "12/06/2025", estado: "Pendiente", monto: 2100000 },
  { id: 3, cliente: "Distribuciones Antioquia", tecnico: "Andrés Rojas",  tipo: "Mantenimiento", fechaProgramada: "13/06/2025", estado: "Anulada",   monto: 420000  },
  { id: 4, cliente: "Café La Montaña",          tecnico: "Mónica Silva",  tipo: "Instalación",  fechaProgramada: "14/06/2025", estado: "Aprobada",  monto: 780000  },
  { id: 5, cliente: "Clínica San Rafael",       tecnico: "Julián Ortiz",  tipo: "Instalación",  fechaProgramada: "15/06/2025", estado: "Garantia",  monto: 0       },
  { id: 6, cliente: "Universidad Central",      tecnico: "Sofía Herrera", tipo: "Mantenimiento", fechaProgramada: "16/06/2025", estado: "Aprobada",  monto: 520000  },
];

function today() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function formatCOP(n?: number) {
  if (n == null) return "—";
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function EstadoPill({ v }: { v: Row["estado"] }) {
  const STYLE: Record<Row["estado"], string> = {
    Aprobada: "text-green-700",
    Pendiente: "text-yellow-700",
    Anulada:  "text-red-700",
    Garantia: "text-blue-700",
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STYLE[v]}`}>{v}</span>;
}

export default function OrdersServicesIndexPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<Row[]>(MOCK);

  // Captura "nueva orden" desde la query (monto opcional)
  useEffect(() => {
    const no = searchParams.get("newOrder");
    if (!no) return;
    try {
      const payload = JSON.parse(decodeURIComponent(no)) as {
        cliente: string;
        tecnico: string;
        tipo: Row["tipo"];
        fechaProgramada?: string;
        monto?: number;
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
          monto: payload.monto ?? undefined,
        };
        return [newRow, ...prev];
      });
      Swal.fire({ icon: "success", title: "Orden creada", timer: 1400, showConfirmButton: false });
    } catch {}
    router.replace(pathname);
  }, [searchParams, pathname, router]);

  // Acciones
  async function setDate(row: Row) {
    const { value, isConfirmed } = await Swal.fire({
      title: `Fecha para #${row.id}`,
      input: "text",
      inputLabel: "Usa el formato DD/MM/AAAA",
      inputValue: row.fechaProgramada,
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
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, fechaProgramada: value } : r)));
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
    await Swal.fire({ icon: "success", title: "Anulada", text: "La orden fue anulada correctamente.", timer: 1500, showConfirmButton: false });
  }

  function printRow() {
    window.print();
  }

  function openCreate() {
    router.push(`/dashboard/orders-services/new?returnTo=${encodeURIComponent(pathname)}`);
  }
  function openEdit(r: Row) {
    router.push(`/dashboard/orders-services/${r.id}`);
  }

  // Columnas (incluye monto)
  const columns: Column<Row>[] = [
    { key: "id", header: "ID", render: (r) => <span>#{r.id}</span> },
    { key: "cliente", header: "Cliente" },
    { key: "tecnico", header: "Técnico" },
    { key: "tipo", header: "Tipo" },
    { key: "fechaProgramada", header: "Fecha" },
    { key: "estado", header: "Estado", render: (r) => <EstadoPill v={r.estado} /> },
    { key: "monto", header: "Monto", render: (r) => <b>{formatCOP(r.monto)}</b> },
  ];

  // Reporte CSV (incluye monto)
  function downloadReport() {
    const headers = ["Id", "Cliente", "Tecnico", "Tipo", "Fecha programada", "Estado", "Monto"];
    const lines = rows.map((r) =>
      [r.id, r.cliente, r.tecnico, r.tipo, r.fechaProgramada, r.estado, r.monto ?? ""]
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

  const rightActions = (
    <div className="flex items-center gap-2">
      <button
        onClick={downloadReport}
        className="cursor-pointer inline-flex h-9 items-center rounded-md bg-[#CC0000] px-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
      >
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
            searchableKeys={["id", "cliente", "tecnico", "tipo", "fechaProgramada", "estado", "monto"]} // ✅ busca por monto
            searchPlaceholder="Buscar (id, técnico, cliente, tipo, estado, fecha, monto)"
            onCreate={openCreate}
            createButtonText="Crear Orden"
            rightActions={rightActions}
            onEdit={(r) => openEdit(r)}
            renderExtraActions={(row) => (
              <>
                <button
                  className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60"
                  title="Calendario"
                  onClick={() => setDate(row)}
                >
                  <img src={ICONS.calendar} className="h-4 w-4" />
                </button>
                <button
                  className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60"
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
                className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60"
                title="Imprimir"
                onClick={printRow}
              >
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
