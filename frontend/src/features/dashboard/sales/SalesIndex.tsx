"use client";

import { useCallback, useMemo, useState } from "react";
import RequireAuth from "../../auth/requireauth";
import {
  Column,
  DataTable,
} from "@/features/dashboard/components/datatable/DataTable";
import { ToastContainer } from "react-toastify";
import { useSales } from "./hooks/useSales";
import { ISale } from "./types/Sales.type";
import Swal from "sweetalert2";
import Modal from "../components/Modal";
import RegisterSaleForm from "./components/RegisterSale";
import ViewSale from "./components/ViewSale";
import { getSaleById } from "./api/sales.api";
import { useLoader } from "@/shared/components/loader";

function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-[spin_0.8s_linear_1]" />
    </div>
  );
}

export default function SalesIndex() {
  const salesHook = useSales();
  const { sales, loading } = salesHook;
  const { showLoader, hideLoader } = useLoader();

  const [isRegisterOpen, setRegisterOpen] = useState(false);

  // Nuevo: modal de detalle
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<ISale | null>(null);

  const confirmDeleteSale = useCallback((sale: ISale) => {
    Swal.fire({
      title: "¿Eliminar?",
      text: `Venta ${sale.salecode}`,
      showCancelButton: true,
      confirmButtonColor: "#b20000",
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Eliminar:", sale.saleid);
      }
    });
  }, []);

  const columns: Column<ISale>[] = useMemo(
    () => [
      { key: "saleid", header: "#", render: (row) => row.saleid.toString() },
      { key: "salecode", header: "Código Venta" },
      {
        key: "customerid",
        header: "Cliente",
        render: (row) => `ID ${row.customerid}`,
      },
      {
        key: "saledate",
        header: "Fecha",
        render: (row) => new Date(row.saledate).toLocaleDateString("es-CO"),
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
          const s = row.salestatus?.toLowerCase();
          const cls =
            s === "completed"
              ? "text-green-600"
              : s === "cancelled"
              ? "text-red-600"
              : "text-gray-600";
          return <span className={`${cls} font-medium`}>{row.salestatus}</span>;
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
            searchableKeys={["salecode", "salestatus"]}
            pageSize={8}
            onDelete={confirmDeleteSale}
            onView={async (row) => {
              try {
                showLoader(); // ⬅ Mostrar loading

                const fullSale = await getSaleById(row.saleid);

                setSelectedSale(fullSale);
                setDetailOpen(true);
              } catch (error) {
                Swal.fire(
                  "Error",
                  "No se pudo cargar el detalle de la venta",
                  "error"
                );
                console.error(error);
              } finally {
                hideLoader(); // ⬅Ocultar loading SIEMPRE al terminar
              }
            }}
            onCreate={() => setRegisterOpen(true)}
            createButtonText="Registrar venta"
          />
        )}

        {/* MODAL PARA REGISTRAR */}
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

        {/* MODAL DETALLE DE VENTA */}
        <Modal
          title="Detalle de venta"
          isOpen={isDetailOpen}
          onClose={() => {
            hideLoader(); // ⬅ APAGAR LOADER AL CERRAR
            setDetailOpen(false);
            setSelectedSale(null); // ⬅ OPCIONAL PERO LIMPIA ESTADO
          }}
          footer={
            <button
              onClick={() => {
                hideLoader(); // ⬅ TAMBIÉN APAGAR AQUÍ
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
