"use client";

import { useCallback, useMemo, useState } from "react";
import RequireAuth from "../../auth/requireauth";
import { DataTable } from "@/features/dashboard/components/datatable/DataTable";
import { Column } from "@/features/dashboard/components/datatable/types/column.types";
import { ToastContainer } from "react-toastify";
import { useSales } from "./hooks/useSales";
import { ISale } from "./types/Sales.type";
import Swal from "sweetalert2";
import Modal from "../components/Modal";
import RegisterSaleForm from "./components/RegisterSale";
import ViewSale from "./components/ViewSale";
import { getSaleById } from "./api/sales.api";
import { useLoader } from "@/shared/components/loader";

/* =======================
   MAPA DE ESTADOS (UI)
======================= */
const statusMap: Record<string, string> = {
  Pending: "Pendiente",
  Completed: "Completada",
  Cancelled: "Cancelada",
};

function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function SalesIndex() {
  const salesHook = useSales();
  const { sales, loading, handleCancelSale } = salesHook;
  const { showLoader, hideLoader } = useLoader();

  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<ISale | null>(null);

  /* =======================
     CONFIRMAR ANULACIÓN
  ======================== */
  const confirmCancelSale = useCallback(
    (sale: ISale) => {
      Swal.fire({
        title: "¿Anular venta?",
        input: "textarea",
        inputLabel: "Motivo de anulación",
        inputPlaceholder: "Escribe el motivo...",
        showCancelButton: true,
        confirmButtonText: "Anular",
        confirmButtonColor: "#b20000",
        preConfirm: (motivo) => {
          if (!motivo || !motivo.trim()) {
            Swal.showValidationMessage("El motivo es obligatorio");
            return false;
          }
          return motivo;
        },
      }).then((result) => {
        if (result.isConfirmed) {
          handleCancelSale(sale.saleid, result.value);
        }
      });
    },
    [handleCancelSale]
  );

  /* =======================
     COLUMNAS TABLA
  ======================== */
  const columns: Column<ISale>[] = useMemo(
    () => [
      {
        key: "saleid",
        header: "#",
        render: (row) => row.saleid.toString(),
      },
      {
        key: "salecode",
        header: "Código Venta",
      },
      {
        key: "customer",
        header: "Cliente",
        render: (row) =>
          row.customer
            ? `${row.customer.name} ${row.customer.lastname ?? ""}`
            : "N/A",
      },
      {
        key: "saledate",
        header: "Fecha",
        render: (row) =>
          row.saledate
            ? new Date(row.saledate).toLocaleDateString("es-CO")
            : "-",
      },
      {
        key: "totalamount",
        header: "Total",
        render: (row) =>
          row.totalamount.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
          }),
      },
      {
        key: "salestatus",
        header: "Estado",
        render: (row) => {
          const status = row.salestatus;
          const s = status?.toLowerCase();

          const cls =
            s === "completed"
              ? "text-green-600"
              : s === "cancelled"
              ? "text-red-600"
              : "text-gray-600";

          return (
            <span className={`${cls} font-medium`}>
              {statusMap[status] ?? status}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <RequireAuth>
      <div className="p-6">
        <ToastContainer position="bottom-right" />
        <h1 className="text-xl font-semibold mb-4">Listado de Ventas</h1>

        {loading ? (
          <Loader />
        ) : (
          <DataTable
            module="sales"
            data={sales}
            columns={columns}
            searchableKeys={[
              "salecode",
              "salestatus",
              "saledate",
              "totalamount",
            ]}
            pageSize={8}
            onDelete={confirmCancelSale} // ← Anulación
            onView={async (row: ISale) => {
              try {
                showLoader();
                const fullSale = await getSaleById(row.saleid);
                setSelectedSale(fullSale);
                setDetailOpen(true);
              } catch (error) {
                Swal.fire(
                  "Error",
                  "No se pudo cargar el detalle de la venta",
                  "error"
                );
              } finally {
                hideLoader();
              }
            }}
            onCreate={() => setRegisterOpen(true)}
            createButtonText="Registrar venta"
          />
        )}

        {/* MODAL REGISTRAR VENTA */}
        <Modal
          title="Registrar venta"
          isOpen={isRegisterOpen}
          onClose={() => setRegisterOpen(false)}
          footer={null}
          widthClass="md:max-w-6xl"
        >
          <RegisterSaleForm
            hook={salesHook}
            onClose={() => setRegisterOpen(false)}
          />
        </Modal>

        {/* MODAL DETALLE */}
        <Modal
          title="Detalle de venta"
          isOpen={isDetailOpen}
          onClose={() => {
            hideLoader();
            setDetailOpen(false);
            setSelectedSale(null);
          }}
          footer={
            <button
              onClick={() => {
                hideLoader();
                setDetailOpen(false);
                setSelectedSale(null);
              }}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-200"
            >
              Cerrar
            </button>
          }
        >
          {selectedSale && <ViewSale sale={selectedSale} />}
        </Modal>
      </div>
    </RequireAuth>
  );
}
