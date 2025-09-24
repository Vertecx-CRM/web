"use client";

import { useState } from "react";
import RequireAuth from "../../auth/requireauth";
import { Column, DataTable } from "../components/datatable/DataTable";
import Modal from "../components/Modal";
import RegisterPurchaseForm from "./components/RegisterPurchase";
import { IPurchase } from "./Types/Purchase.type";
import { purchases as mockPurchases } from "./mock/purchases.mock";
import ViewPurchase from "./components/ViewPurchase";
import { ToastContainer } from "react-toastify";

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

  const handleAddPurchase = (newPurchase: IPurchase) => {
    setPurchasesData((prev) => [
      ...prev,
      { ...newPurchase, id: prev.length + 1 },
    ]);
    setRegisterModalOpen(false); // cerrar modal al guardar
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
