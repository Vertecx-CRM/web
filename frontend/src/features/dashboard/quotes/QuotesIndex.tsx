"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import RequireAuth from "../../auth/requireauth";
import { DataTable } from "../components/datatable/DataTable";
import Modal from "../components/Modal";
import { ToastContainer } from "react-toastify";
import { Column } from "../components/datatable/types/column.types";
import Image from "next/image";

import RegisterQuoteForm from "./components/RegisterQuote";
import ViewQuote from "./components/ViewQuote";
import {
  createQuote,
  getQuotes,
  approveQuote,
  cancelQuote,
  revokeQuote,
} from "./api/quotes.api";
import { QuoteTableRow } from "./types/Quote.type";

/* ================================
 * NORMALIZACIÓN DE ESTADOS (VISUAL)
 * ================================ */
type QuoteStatusConfig = {
  label: string;
  className: string;
};

const normalizeQuoteStatus = (status?: string): QuoteStatusConfig => {
  if (!status) {
    return { label: "—", className: "text-slate-500" };
  }

  const value = status.toLowerCase();

  if (value.includes("pend")) {
    return { label: "Pendiente", className: "text-yellow-600" };
  }

  if (value.includes("aprob") || value.includes("approved")) {
    return { label: "Aprobada", className: "text-green-600" };
  }

  if (value.includes("cancel")) {
    return { label: "Cancelada", className: "text-gray-600" };
  }

  if (value.includes("revoke") || value.includes("anul")) {
    return { label: "Anulada", className: "text-red-600" };
  }

  return { label: status, className: "text-slate-500" };
};

/* ================================
 * ESTADO EN ESPAÑOL (BÚSQUEDA)
 * ================================ */
const normalizeQuoteStatusText = (status?: string): string => {
  if (!status) return "";

  const value = status.toLowerCase();

  if (value.includes("pend")) return "pendiente";
  if (value.includes("aprob") || value.includes("approved")) return "aprobada";
  if (value.includes("cancel")) return "cancelada";
  if (value.includes("revoke") || value.includes("anul")) return "anulada";

  return value;
};

export default function QuotesIndex() {
  const [quotesData, setQuotesData] = useState<QuoteTableRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  /* ================================
   * CARGAR COTIZACIONES
   * ================================ */
  const fetchQuotes = async () => {
    setLoading(true);

    const data = await getQuotes();

    const mapped: QuoteTableRow[] = data.map((q: any) => {
      const rawStatus = q.state?.name ?? "";

      return {
        id: q.quotesid,
        client: `${q.customer?.users?.name ?? ""} ${
          q.customer?.users?.lastname ?? ""
        }`,
        technician: `${q.technician?.users?.name ?? ""} ${
          q.technician?.users?.lastname ?? ""
        }`,
        status: rawStatus, // render
        statusSearch: normalizeQuoteStatusText(rawStatus), // 🔑 búsqueda en español
        creationDate: q.createdat,
        amount: Number(q.total),
        raw: q,
      };
    });

    setQuotesData(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  /* ================================
   * COLUMNAS
   * ================================ */
  const columns: Column<QuoteTableRow>[] = [
    { key: "id", header: "ID" },
    { key: "client", header: "Cliente" },
    { key: "technician", header: "Técnico" },
    {
      key: "creationDate",
      header: "Fecha",
      render: (row) => new Date(row.creationDate).toLocaleDateString("es-CO"),
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => {
        const config = normalizeQuoteStatus(row.status);
        return (
          <span className={`font-semibold ${config.className}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: "amount",
      header: "Total",
      render: (row) =>
        row.amount.toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
        }),
    },
  ];

  /* ================================
   * APROBAR
   * ================================ */
  const handleApproveQuote = async (row: QuoteTableRow) => {
    const r = await Swal.fire({
      title: "¿Aprobar cotización?",
      text: `Total: ${row.amount.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
      })}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#16a34a",
    });

    if (!r.isConfirmed) return;

    await approveQuote(row.id);
    await fetchQuotes();

    Swal.fire("Aprobada", "Cotización aprobada correctamente", "success");
  };

  /* ================================
   * CANCELAR (CLIENTE)
   * ================================ */
  const handleCancelQuote = async (row: QuoteTableRow) => {
    const r = await Swal.fire({
      title: "¿Cancelar cotización?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Volver",
      confirmButtonColor: "#b91c1c",
    });

    if (!r.isConfirmed) return;

    await cancelQuote(row.id);
    await fetchQuotes();

    Swal.fire("Cancelada", "Cotización cancelada", "success");
  };

  /* ================================
   * ANULAR (ADMIN)
   * ================================ */
  const handleRevokeQuote = async (row: QuoteTableRow) => {
    const status = row.statusSearch;

    if (status !== "aprobada") {
      await Swal.fire({
        icon: "warning",
        title: "Acción no permitida",
        text: "Solo se pueden anular cotizaciones que estén aprobadas.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#b20000",
      });
      return;
    }

    const r = await Swal.fire({
      title: "¿Anular cotización?",
      input: "textarea",
      inputLabel: "Observación (opcional)",
      inputPlaceholder: "Motivo de la anulación",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Anular",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b20000",
    });

    if (!r.isConfirmed) return;

    await revokeQuote(row.id, r.value);
    await fetchQuotes();

    await Swal.fire({
      icon: "success",
      title: "Cotización anulada",
      text: "La cotización fue anulada correctamente.",
    });
  };

  /* ================================
   * CREAR
   * ================================ */
  const handleAddQuote = async (payload: any) => {
    await createQuote(payload);
    await fetchQuotes();
    setRegisterModalOpen(false);
  };

  /* ================================
   * RENDER
   * ================================ */
  return (
    <RequireAuth>
      <div className="p-6">
        <ToastContainer position="bottom-right" />
        <h1 className="text-xl font-semibold mb-4">Listado de Cotizaciones</h1>

        <DataTable<QuoteTableRow>
          module="quotes"
          data={quotesData}
          columns={columns}
          loading={loading}
          searchableKeys={[
            "id",
            "client",
            "technician",
            "statusSearch", // 👈 estado en español
            "amount",
            "creationDate",
          ]}
          pageSize={8}
          onView={(row) => {
            setSelectedQuote(row.raw);
            setDetailModalOpen(true);
          }}
          onCreate={() => setRegisterModalOpen(true)}
          createButtonText="Crear Cotización"
          onCheck={handleApproveQuote}
          onCancel={handleCancelQuote}
          onDelete={handleRevokeQuote}
          rightActions={
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#b20000] text-white text-sm font-semibold hover:bg-[#910000]">
              <Image
                src="/icons/download.svg"
                alt="Descargar"
                width={16}
                height={16}
              />
              Descargar Reporte
            </button>
          }
        />

        <Modal
          title="Registrar Cotización"
          isOpen={isRegisterModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          footer={null}
        >
          <RegisterQuoteForm onSave={handleAddQuote} />
        </Modal>

        <Modal
          title="Detalle de Cotización"
          isOpen={isDetailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          footer={null}
        >
          {selectedQuote && <ViewQuote quote={selectedQuote} />}
        </Modal>
      </div>
    </RequireAuth>
  );
}
