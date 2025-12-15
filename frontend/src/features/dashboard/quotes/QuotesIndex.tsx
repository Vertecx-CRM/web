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
import { createQuote, getQuotes } from "./api/quotes.api";
import { QuoteTableRow } from "./types/Quote.type";

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

    const mapped: QuoteTableRow[] = data.map((q: any) => ({
      id: q.quotesid,
      client: `${q.customer?.users?.name ?? ""} ${
        q.customer?.users?.lastname ?? ""
      }`,
      technician: `${q.technician?.users?.name ?? ""} ${
        q.technician?.users?.lastname ?? ""
      }`,
      status: q.state?.name ?? "—",
      creationDate: q.createdat,
      amount: Number(q.total),
      raw: q,
    }));

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
        const map: Record<string, string> = {
          Pendient: "text-yellow-600",
          Aprobada: "text-green-600",
          Anulada: "text-red-600",
        };
        return (
          <span className={`font-semibold ${map[row.status] ?? ""}`}>
            {row.status}
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
   * ANULAR
   * ================================ */
  const handleCancelQuote = (row: QuoteTableRow) => {
    Swal.fire({
      title: "¿Anular cotización?",
      text: `Cliente: ${row.client}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, anular",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b20000",
    }).then((r) => {
      if (r.isConfirmed) {
        // aquí iría el endpoint real de anulación
        Swal.fire("Anulada", "Cotización anulada", "success");
      }
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
          searchableKeys={["client", "technician", "status"]}
          pageSize={8}
          onView={(row) => {
            setSelectedQuote(row.raw);
            setDetailModalOpen(true);
          }}
          onCancel={handleCancelQuote}
          onCreate={() => setRegisterModalOpen(true)}
          createButtonText="Crear Cotización"
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

        {/* MODAL CREAR */}
        <Modal
          title="Registrar Cotización"
          isOpen={isRegisterModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          footer={null}
        >
          <RegisterQuoteForm onSave={handleAddQuote} />
        </Modal>

        {/* MODAL VER */}
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
