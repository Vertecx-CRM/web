"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useSales } from "./hooks/useSales";
import CreateSaleModal from "./components/CreateSales/CreateSales";
import ViewSaleModal from "./components/ViewSalesModal/ViewSales";
import CancelSaleModal from "./components/CancelSaleModal/CancelSaleModal";
import SalesTable from "./components/SalesTable/SalesTable";

export default function SalesPage() {
  const {
    sales,
    isCreateModalOpen,
    setIsCreateModalOpen,
    viewingSale,
    cancelingSale,
    handleCreateSale,
    handleView,
    openCancelModal,
    confirmCancelSale,
    closeModals,
  } = useSales();

  const isViewModalOpen = !!viewingSale;
  const isCancelModalOpen = !!cancelingSale;

  return (
    <div className="min-h-screen flex">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col px-6 pt-6">
          <CreateSaleModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateSale}
          />

          <ViewSaleModal isOpen={isViewModalOpen} onClose={closeModals} sale={viewingSale} />

          <CancelSaleModal
            isOpen={isCancelModalOpen}
            onClose={closeModals}
            sale={cancelingSale}
            onCancel={confirmCancelSale} // recibe (id, motivo)
          />

          <SalesTable
            sales={sales}
            onView={handleView}
            onCancel={openCancelModal} // recibe sale y abre modal
            onCreate={() => setIsCreateModalOpen(true)}
          />
        </main>
      </div>
    </div>
  );
}