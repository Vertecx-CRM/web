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
        title: "¿Está seguro?",
        text: `¿Desea anular la compra #${purchase.numberoforder}?`,
        showCancelButton: true,
        confirmButtonColor: "#b20000",
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
            onCreate={() => setRegisterModalOpen(true)}
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
