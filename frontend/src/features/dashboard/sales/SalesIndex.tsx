"use client";

import { useState } from "react";
import RequireAuth from "../../auth/requireauth";
import { Column, DataTable } from "../components/DataTable";
import Modal from "../components/Modal";
import { mockSales } from "./mocks/mockSales";
import CreateSaleModal from "./components/CreateSales/CreateSales";
import ViewSaleModal from "./components/ViewSalesModal/ViewSales";
import { Sale } from "./types/typesSales";

export default function SalesIndex() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const columns: Column<Sale>[] = [
    { key: "codigoVenta", header: "Código Venta" },
    { key: "cliente", header: "Cliente" },
    {
      key: "fecha",
      header: "Fecha",
      render: (row) => {
        const date = new Date(row.fecha as string);
        return date.toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      key: "total",
      header: "Total",
      render: (row) => (
        <span className="font-medium text-gray-700">
          ${row.total.toLocaleString("es-CO")}
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (row) => (
        <span
          className={`font-semibold ${
            row.estado === "Finalizado" ? "text-green-600" : "text-red-600"
          }`}
        >
          {row.estado}
        </span>
      ),
    },
  ];

  return (
    <RequireAuth>
      <div className="p-6">
        {/* 🔹 Encabezado */}
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Listado de Ventas
        </h1>

        {/* 🔹 Tabla general */}
        <DataTable<Sale>
          data={mockSales}
          columns={columns}
          searchableKeys={["codigoVenta", "cliente", "estado", "fecha"]}
          pageSize={5}
          onView={(row) => {
            setSelectedSale(row);
            setIsDetailModalOpen(true);
          }}
          onCancel={(row) => console.log("🟠 Anular venta →", row)}
          onCreate={() => setIsCreateModalOpen(true)}
          createButtonText="Crear Venta"
        />

        {/* 🔹 Modal Crear Venta */}
        <Modal
          title="Registrar Venta"
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          footer={
            <>
              <button
                onClick={() => setIsCreateModalOpen(false)}
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
          <CreateSaleModal />
        </Modal>

        {/* 🔹 Modal Detalle de Venta */}
        <Modal
          title="Detalle de Venta"
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          footer={
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-gray-300 text-black"
            >
              Cerrar
            </button>
          }
        >
          {selectedSale && <ViewSaleModal sale={selectedSale} />}
        </Modal>
      </div>
    </RequireAuth>
  );
}

