"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import RequireAuth from "../../auth/requireauth";
import { DataTable } from "../components/datatable/DataTable";
import Modal from "../components/Modal";
import { ToastContainer } from "react-toastify";
import { Column } from "../components/datatable/types/column.types";
import { IQuote } from "./types/Quote.type";
import { quotes as mockQuotes } from "./mock/quotes.mock";
import RegisterQuoteForm from "./components/RegisterQuote";
import ViewQuote from "./components/ViewQuote";
import Image from "next/image";

export default function QuotesIndex() {
  const [quotesData, setQuotesData] = useState<IQuote[]>(mockQuotes);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<IQuote | null>(null);

  /** ================================
   * 🧾 Columnas de la tabla
   * ================================ */
  const columns: Column<IQuote>[] = [
    { key: "id", header: "Id" },
    { key: "client", header: "Cliente" },
    {
      key: "creationDate",
      header: "Fecha de creación",
      render: (row) => {
        const date = new Date(row.creationDate);
        return date.toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => {
        let color = "";
        switch (row.status) {
          case "Aprobada":
            color = "text-green-600";
            break;
          case "Pendiente":
            color = "text-yellow-600";
            break;
          case "Anulada":
            color = "text-red-500";
            break;
          case "Rechazada":
            color = "text-red-600";
            break;
          default:
            color = "text-gray-700";
        }
        return <span className={`font-semibold ${color}`}>{row.status}</span>;
      },
    },
    {
      key: "amount",
      header: "Total",
      render: (row) => (
        <span className="font-medium text-gray-800">
          {row.amount.toLocaleString("es-CO")}
        </span>
      ),
    },
  ];

  /** ================================
   * ⚠️ SweetAlert para Anular Cotización
   * ================================ */
  const handleCancelQuote = (quote: IQuote) => {
    Swal.fire({
      html: `
      <div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#E11900" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path fill="#E11900" d="M11.08 2.6L1.15 20a1 1 0 0 0 .92 1.5h19.86a1 1 0 0 0 .92-1.5L12.92 2.6a1 1 0 0 0-1.84 0z"/>
          <line x1="12" y1="9" x2="12" y2="13" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="17" r="2" fill="white"/>
        </svg>
        <h2 style="font-size:1.35rem;font-weight:700;margin:0;color:#000;">¿Está seguro?</h2>
        <p style="font-size:0.95rem;margin:0;color:#111;">
          Desea anular la cotización de <b>${quote.client}</b>?
        </p>
        <p style="font-size:0.9rem;margin:0;color:#555;">
          Fecha: ${quote.creationDate}
        </p>
      </div>
      `,
      background: "#ffffff",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,
      width: "360px",
      padding: "25px 10px 20px",
      customClass: {
        popup:
          "rounded-xl shadow-lg border border-gray-200 font-sans animate__animated animate__fadeIn",
        actions: "flex justify-center gap-3 mt-2",
        confirmButton:
          "cursor-pointer px-5 py-2.5 rounded-md font-semibold text-white text-sm bg-[#E11900] hover:bg-[#c01000] transition hover:scale-105",
        cancelButton:
          "cursor-pointer px-5 py-2.5 rounded-md font-semibold text-gray-900 text-sm bg-white border border-gray-300 hover:bg-gray-100 transition hover:scale-105",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        setQuotesData((prev) =>
          prev.map((q) => (q.id === quote.id ? { ...q, status: "Anulada" } : q))
        );
        Swal.fire({
          icon: "success",
          title: "Cotización anulada",
          text: `La cotización de ${quote.client} fue anulada correctamente.`,
          confirmButtonColor: "#b20000",
          confirmButtonText: "Aceptar",
        });
      }
    });
  };

  /** ================================
   * ➕ Agregar Cotización Nueva
   * ================================ */
  const handleAddQuote = (newQuote: IQuote) => {
    setQuotesData((prev) => [...prev, { ...newQuote, id: prev.length + 1 }]);
    setRegisterModalOpen(false);
  };

  /** ================================
   * ⚙️ Render principal
   * ================================ */
  return (
    <RequireAuth>
      <div className="p-6">
        <ToastContainer position="bottom-right" />
        <h1 className="text-xl font-semibold mb-4">Listado de Cotizaciones</h1>

        {/* 🧩 Tabla de Cotizaciones */}
        <DataTable<IQuote>
          data={quotesData}
          columns={columns}
          searchableKeys={["client", "status", "creationDate"]}
          pageSize={8}
          onView={(row) => {
            setSelectedQuote(row);
            setDetailModalOpen(true);
          }}
          onEdit={(row) => {
            setSelectedQuote(row);
            setEditModalOpen(true);
          }}
          onCheck={(row) => {
            setQuotesData((prev) =>
              prev.map((q) =>
                q.id === row.id ? { ...q, status: "Aprobada" } : q
              )
            );
          }}
          onCancel={(row) => handleCancelQuote(row)}
          onCreate={() => setRegisterModalOpen(true)}
          createButtonText="Crear Cotización"
          rightActions={
            <button className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#b20000] text-white text-sm font-semibold hover:bg-[#910000] transition-all hover:scale-105">
              <Image
                src="/icons/download.svg"
                alt="Descargar"
                width={16}
                height={16}
              />
              Descargar Reporte
            </button>
          }
          tailHeader="Imprimir"
          renderTail={(row) => (
            <button
              className="p-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60"
              title="Imprimir"
              onClick={() => console.log("🖨️ Imprimir", row)}
            >
              <Image
                src="/assets/imgs/Printer.png"
                alt="Imprimir"
                width={18}
                height={18}
              />
            </button>
          )}
        />

        {/* 🧾 Modal Registrar Cotización */}
        <Modal
          title="Registrar Cotización"
          isOpen={isRegisterModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          footer={null}
        >
          <RegisterQuoteForm onSave={handleAddQuote} quotes={quotesData} />
        </Modal>

        {/* 👁️ Modal Ver Detalle */}
        <Modal
          title="Detalle de Cotización"
          isOpen={isDetailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          footer={
            <button
              onClick={() => setDetailModalOpen(false)}
              className="cursor-pointer transition duration-300 hover:bg-gray-200 hover:scale-105 px-4 py-2 rounded-lg bg-gray-300 text-black"
            >
              Cerrar
            </button>
          }
        >
          {selectedQuote && <ViewQuote quote={selectedQuote} />}
        </Modal>
      </div>
    </RequireAuth>
  );
}
