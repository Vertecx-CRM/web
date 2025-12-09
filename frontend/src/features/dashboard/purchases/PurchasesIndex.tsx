"use client";

import { useCallback, useMemo, useState } from "react";
import Swal from "sweetalert2";
import RequireAuth from "../../auth/requireauth";
import { DataTable } from "../components/datatable/DataTable";
import Modal from "../components/Modal";
import RegisterPurchaseForm from "./components/RegisterPurchase";
import { IPurchase } from "./Types/Purchase.type";
import ViewPurchase from "./components/ViewPurchase";
import { ToastContainer } from "react-toastify";
import { Column } from "../components/datatable/types/column.types";
import { usePurchases } from "./hooks/usePurchases";

function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-[spin_0.8s_linear_1]" />
    </div>
  );
}

export default function PurchasesIndex() {
  const purchasesHook = usePurchases();

  const {
    purchases,
    loading,
    saving,
    handleAddPurchase,
    handleCancelPurchase,
    form,
    selectedProduct,
    setSelectedProduct,
    quantity,
    setQuantity,
    cart,
    years,
    daysInMonth,
    total,
    handleChange,
    handleAddProduct,
    products,
    suppliers,
  } = purchasesHook;

  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<IPurchase | null>(
    null
  );

  const columns: Column<IPurchase>[] = useMemo(
    () => [
      { key: "numberoforder", header: "N° Orden" },
      { key: "reference", header: "N° Factura" },
      {
        key: "supplier",
        header: "Proveedor",
        render: (row) => row.supplier?.name ?? "N/A",
      },
      {
        key: "createdat",
        header: "Fecha de Registro",
        render: (row) => new Date(row.createdat).toLocaleDateString(),
      },
      {
        key: "amount",
        header: "Monto",
        render: (row) =>
          row.amount.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
          }),
      },
      {
        key: "state",
        header: "Estado",
        render: (row) => {
          const s = row.state?.name?.toLowerCase();
          const label =
            s === "approved"
              ? "Aprobado"
              : s === "revoke"
              ? "Anulado"
              : row.state?.name ?? "Desconocido";

          const cls =
            s === "approved"
              ? "text-green-600 font-medium"
              : s === "revoke"
              ? "text-red-600 font-medium"
              : "text-gray-500 font-medium";

          return <span className={cls}>{label}</span>;
        },
      },
    ],
    []
  );

  const confirmCancelPurchase = useCallback(
    (purchase: IPurchase) => {
      Swal.fire({
        html: `
        <div class="flex flex-col items-center">
          <div class="text-red-600 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 
              1.732-3L13.732 4a2 2 0 00-3.464 0L3.34 
              16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 class="text-xl font-semibold mb-2">¿Está seguro?</h2>

          <p class="text-gray-700 mb-1">
            ¿Desea anular la compra #${purchase.numberoforder}?
          </p>
          <p class="text-gray-500 text-sm">
            Fecha: ${new Date(purchase.createdat).toLocaleDateString()}
          </p>
        </div>
      `,
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",

        customClass: {
          popup: "rounded-2xl p-6",
          confirmButton:
            "bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition",
          cancelButton:
            "bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition mr-3",
        },

        buttonsStyling: false,
        width: "380px",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await handleCancelPurchase(purchase.purchaseorderid);
        }
      });
    },
    [handleCancelPurchase]
  );

  return (
    <RequireAuth>
      <div className="p-6">
        <ToastContainer position="bottom-right" />
        <h1 className="text-xl font-semibold mb-4">Listado de Compras</h1>

        {loading || saving ? (
          <Loader />
        ) : (
          <DataTable
            module="purchases"
            data={purchases}
            columns={columns}
            searchableKeys={[
              "numberoforder",
              "reference",
              "createdat",
              "amount",
            ]}
            pageSize={8}
            onCancel={confirmCancelPurchase}
            onCreate={() => {
              purchasesHook.resetForm();
              setRegisterModalOpen(true);
            }}
            onView={(row) => {
              setSelectedPurchase(row);
              setDetailModalOpen(true);
            }}
            createButtonText="Registrar compra"
          />
        )}

        <Modal
          title="Registrar compra"
          isOpen={isRegisterModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          footer={null}
        >
          <RegisterPurchaseForm
            onClose={() => setRegisterModalOpen(false)}
            onSave={handleAddPurchase}
            purchases={purchases}
            form={form}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            quantity={quantity}
            setQuantity={setQuantity}
            cart={cart}
            years={years}
            daysInMonth={daysInMonth}
            total={total}
            handleChange={handleChange}
            handleAddProduct={handleAddProduct}
            products={products}
            suppliers={suppliers}
          />
        </Modal>

        <Modal
          title="Detalle de compra"
          isOpen={isDetailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          footer={
            <button
              onClick={() => setDetailModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-200"
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
