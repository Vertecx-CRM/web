"use client";

import { useState } from "react";
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
      <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
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
    setForm,
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

  const columns: Column<IPurchase>[] = [
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
      render: (row) => (
        <span className="font-medium text-gray-700">
          {row.amount.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
          })}
        </span>
      ),
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
  ];

  const confirmCancelPurchase = (purchase: IPurchase) => {
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
            Desea anular la compra <b>#${purchase.numberoforder}</b>?
          </p>
          <p style="font-size:0.9rem;margin:0;color:#555;">
            Fecha: ${new Date(purchase.createdat).toLocaleDateString()}
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Anulando compra...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          await handleCancelPurchase(purchase.purchaseorderid);

          Swal.fire({
            icon: "success",
            title: "Compra anulada",
            text: `La compra #${purchase.numberoforder} fue anulada correctamente.`,
            confirmButtonColor: "#b20000",
            confirmButtonText: "Aceptar",
          });
        } catch (error: any) {
          const backendMsg =
            error?.response?.data?.message || "Error desconocido";

          if (
            typeof backendMsg === "string" &&
            backendMsg.toLowerCase().includes("ya está anulada")
          ) {
            Swal.fire({
              icon: "warning",
              title: "Ya está anulada",
              text: "Esta compra ya se encuentra anulada.",
              confirmButtonColor: "#b20000",
              confirmButtonText: "Aceptar",
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No se pudo anular la compra. Inténtalo de nuevo.",
              confirmButtonColor: "#b20000",
              confirmButtonText: "Aceptar",
            });
          }
        }
      }
    });
  };

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
              "purchaseorderid",
              "numberoforder",
              "reference",
              "supplier",
              "createdat",
              "amount",
              "state",
            ]}
            pageSize={8}
            onCancel={(row) => confirmCancelPurchase(row)}
            onCreate={() => setRegisterModalOpen(true)}
            onView={(row) => {
              setSelectedPurchase(row);
              setDetailModalOpen(true);
            }}
            createButtonText="Registrar compra"
          />
        )}

        {/* Modal Registrar */}
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
