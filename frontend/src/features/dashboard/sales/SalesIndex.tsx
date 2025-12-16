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
import { formatSaleCustomerLabel } from "./helpers/saleCustomerHelpers";
import Swal from "sweetalert2";
import Modal from "../components/Modal";
import RegisterSaleForm from "./components/RegisterSale";
import ViewSale from "./components/ViewSale";
import { cancelSale, getSaleById } from "./api/sales.api";
import { useLoader } from "@/shared/components/loader";
import { translateSaleStatus } from "./helpers/saleStatusHelpers";
import { useAuth } from "@/features/auth/authcontext";

function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-[spin_0.8s_linear_1]" />
    </div>
  );
}

export default function SalesIndex() {
  const salesHook = useSales();
  const { sales, loading, customers, refreshSales } = salesHook;
  const { showLoader, hideLoader } = useLoader();
  const { user, profile } = useAuth();

  const [isRegisterOpen, setRegisterOpen] = useState(false);

  // Nuevo: modal de detalle
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<ISale | null>(null);

  const confirmCancelSale = useCallback(
    async (sale: ISale) => {
      const result = await Swal.fire({
        title: "¿Estás seguro de cancelar?",
        text: `Anular la venta ${sale.salecode}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#b20000",
        confirmButtonText: "Cancelar venta",
        cancelButtonText: "Volver",
        input: "textarea",
        inputLabel: "Motivo de cancelación",
        inputPlaceholder: "Describe el motivo",
        inputAttributes: {
          "aria-label": "Motivo de cancelación",
        },
        preConfirm: (value) => {
          const reason = String(value ?? "").trim();
          if (!reason) {
            Swal.showValidationMessage("Debes indicar un motivo");
            return null;
          }
          return reason;
        },
      });

      if (!result.isConfirmed) {
        return;
      }

      const observation = String(result.value ?? "").trim();
      showLoader();
      try {
        await cancelSale(sale.saleid, observation);
        await refreshSales();
        await Swal.fire(
          "Venta cancelada",
          "El estado se actualizó correctamente.",
          "success"
        );
      } catch (error) {
        console.error("No se pudo cancelar la venta:", error);
        Swal.fire(
          "Error",
          error instanceof Error
            ? error.message
            : "No se pudo cancelar la venta",
          "error"
        );
      } finally {
        hideLoader();
      }
    },
    [hideLoader, refreshSales, showLoader]
  );

  const columns: Column<ISale>[] = useMemo(
    () => [
      { key: "saleid", header: "#", render: (row) => row.saleid.toString() },
      { key: "salecode", header: "Código Venta" },
      {
        key: "customerid",
        header: "Cliente",
        render: (row) => {
          const customerLabel = formatSaleCustomerLabel(row, customers);
          return (
            <span
              className={
                customerLabel.isMissing ? "text-gray-400 italic" : "font-medium"
              }
            >
              {customerLabel.label}
            </span>
          );
        },
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
          return (
            <span className={`${cls} font-medium`}>
              {translateSaleStatus(row.salestatus)}
            </span>
          );
        },
      },
    ],
    [customers]
  );

  const normalizedRoleName = (
    profile?.rolename ?? user?.rolename ?? ""
  ).toLowerCase();
  const isClientUser =
    normalizedRoleName.includes("client") ||
    normalizedRoleName.includes("cliente");

  const filteredSales = useMemo(() => {
    if (isClientUser && user?.userid != null) {
      return sales.filter(
        (sale) => sale.customer?.userid === user.userid
      );
    }
    return sales;
  }, [sales, user?.userid, isClientUser]);

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
            data={filteredSales}
            columns={columns}
            searchableKeys={["salecode", "salestatus"]}
            pageSize={8}
            onCancel={confirmCancelSale}
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
