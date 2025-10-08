"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import RequireAuth from "../../auth/requireauth";
import { DataTable } from "../components/datatable/DataTable";
import Modal from "../components/Modal";
import RegisterPurchaseForm from "./components/RegisterPurchase";
import { IPurchase } from "./Types/Purchase.type";
import { purchases as mockPurchases } from "./mock/purchases.mock";
import ViewPurchase from "./components/ViewPurchase";
import { ToastContainer } from "react-toastify";
import { Column } from "../components/datatable/types/column.types";

export default function PurchasesIndex() {
  const [purchasesData, setPurchasesData] =
    useState<IPurchase[]>(mockPurchases);

  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<IPurchase | null>(
    null
  );

  const columns: Column<IPurchase>[] = [
    { key: "orderNumber", header: "N° Orden" },
    { key: "invoiceNumber", header: "N° Factura" },
    { key: "supplier", header: "Proveedor" },
    { key: "registerDate", header: "Fecha de Registro" },
    {
      key: "amount",
      header: "Monto",
      render: (row) => (
        <span className="font-medium text-gray-700">
          ${row.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => (
        <span
          className={
            row.status === "Aprobado"
              ? "text-green-600 font-medium"
              : "text-red-600 font-medium"
          }
        >
          {row.status}
        </span>
      ),
    },
  ];

  /** ✅ SweetAlert idéntico al diseño de la imagen */
  const handleCancelPurchase = (purchase: IPurchase) => {
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
        Desea anular la compra <b>#${purchase.orderNumber}</b>?
      </p>
      <p style="font-size:0.9rem;margin:0;color:#555;">
        Fecha: ${purchase.registerDate}
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
        actions: "flex justify-center gap-3 mt-2", // 👈 Aquí se separan los botones
        confirmButton:
          "cursor-pointer px-5 py-2.5 rounded-md font-semibold text-white text-sm bg-[#E11900] hover:bg-[#c01000] transition hover:scale-105",
        cancelButton:
          "cursor-pointer px-5 py-2.5 rounded-md font-semibold text-gray-900 text-sm bg-white border border-gray-300 hover:bg-gray-100 transition hover:scale-105",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        setPurchasesData((prev) =>
          prev.map((p) =>
            p.id === purchase.id ? { ...p, status: "Anulado" } : p
          )
        );
        Swal.fire({
          icon: "success",
          title: "Compra anulada",
          text: `La compra #${purchase.orderNumber} fue anulada correctamente.`,
          confirmButtonColor: "#b20000",
          confirmButtonText: "Aceptar",
        });
      }
    });
  };

  const handleAddPurchase = (newPurchase: IPurchase) => {
    setPurchasesData((prev) => [
      ...prev,
      { ...newPurchase, id: prev.length + 1 },
    ]);
    setRegisterModalOpen(false);
  };

  return (
    <RequireAuth>
      <div className="p-6">
        <ToastContainer position="bottom-right" />
        <h1 className="text-xl font-semibold mb-4">Listado de Compras</h1>

        <DataTable
          data={purchasesData}
          columns={columns}
          searchableKeys={[
            "orderNumber",
            "invoiceNumber",
            "supplier",
            "registerDate",
            "amount",
            "status",
          ]}
          pageSize={8}
          onCancel={(row) => handleCancelPurchase(row)}
          onCreate={() => setRegisterModalOpen(true)}
          onView={(row) => {
            setSelectedPurchase(row);
            setDetailModalOpen(true);
          }}
          createButtonText="Registrar compra"
        />

        {/* Modal Registrar */}
        <Modal
          title="Registrar compra"
          isOpen={isRegisterModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          footer={null}
        >
          <RegisterPurchaseForm
            onSave={handleAddPurchase}
            purchases={purchasesData}
          />
        </Modal>

        {/* Modal Ver Detalle */}
        <Modal
          title="Detalle de compra"
          isOpen={isDetailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          footer={
            <button
              onClick={() => setDetailModalOpen(false)}
              className="cursor-pointer transition duration-300 hover:bg-gray-200 hover:text-black hover:scale-105 px-4 py-2 rounded-lg bg-gray-300 text-black"
            >
              Cerrar
            </button>
          }
        >
          {selectedPurchase && <ViewPurchase purchase={selectedPurchase} />}
        </Modal>
      </div>
    </RequireAuth>
  );
}
