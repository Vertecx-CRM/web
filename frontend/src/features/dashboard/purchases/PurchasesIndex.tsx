"use client";

import { useState } from "react";
import RequireAuth from "../../auth/requireauth";
import { Column, DataTable } from "../components/DataTable";
import Modal from "../components/Modal";
import RegisterPurchaseForm from "./RegisterPurchase";
import { IPurchase } from "./Types/Purchase.type";
import SeeMorePurchase from "./SeeMorePurchase";

const purchases: IPurchase[] = [
  {
    id: 1,
    orderNumber: "OC-2025-001",
    invoiceNumber: "FAC-2025-1001",
    supplier: "Proveedor A",
    registerDate: "2025-08-20",
    amount: 1200.5,
    status: "Aprobado",
  },
  {
    id: 2,
    orderNumber: "OC-2025-002",
    invoiceNumber: "FAC-2025-1002",
    supplier: "Proveedor B",
    registerDate: "2025-08-21",
    amount: 530.0,
    status: "Anulado",
  },
  {
    id: 3,
    orderNumber: "OC-2025-003",
    invoiceNumber: "FAC-2025-1003",
    supplier: "Proveedor C",
    registerDate: "2025-08-22",
    amount: 890.75,
    status: "Aprobado",
  },
];

export default function PurchasesIndex() {
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<IPurchase | null>(
    null
  );

  const columns: Column<IPurchase>[] = [
    { key: "orderNumber", header: "N° Orden" },
    { key: "invoiceNumber", header: "Factura" },
    { key: "supplier", header: "Proveedor" },
    { key: "registerDate", header: "Fecha Registro" },
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

  return (
    <RequireAuth>
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Listado de Compras</h1>

        <DataTable
          data={purchases}
          columns={columns}
          searchableKeys={[
            "orderNumber",
            "invoiceNumber",
            "supplier",
            "registerDate",
            "amount",
            "status",
          ]}
          pageSize={5}
          onCancel={(row) => console.log("Anular →", row)}
          onCreate={() => setRegisterModalOpen(true)}
          onView={(row) => {
            // 👈 usa onView
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
          footer={
            <>
              <button
                onClick={() => setRegisterModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 text-black"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 rounded-lg bg-black text-white">
                Guardar
              </button>
            </>
          }
        >
          <RegisterPurchaseForm />
        </Modal>

        {/* Modal Ver Detalle */}
        <Modal
          title="Detalle de compra"
          isOpen={isDetailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          footer={
            <button
              onClick={() => setDetailModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-gray-300 text-black"
            >
              Cerrar
            </button>
          }
        >
          {selectedPurchase && <SeeMorePurchase purchase={selectedPurchase} />}
        </Modal>
      </div>
    </RequireAuth>
  );
}
