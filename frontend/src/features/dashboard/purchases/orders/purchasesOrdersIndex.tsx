"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { usePurchaseOrders } from "./hooks/usePurchaseOrders";
import CreatePurchaseOrderModal from "./components/CreatePurchaseOrderModal/CreatePurchaseOrder";
import PurchaseOrdersTable from "./components/PurchaseOrdersTable/PurchaseOrdersTable";
import ViewPurchaseOrderModal from "./components/ViewPurchaseOrderModal/viewPurchaseOrder";

export default function PurchaseOrdersIndex() {
  const {
    purchaseOrders,
    isCreateModalOpen,
    setIsCreateModalOpen,
    viewingPurchaseOrder,
    handleCreatePurchaseOrder,
    handleView,
    closeModals
  } = usePurchaseOrders();

  const isViewModalOpen = !!viewingPurchaseOrder;

  return (
    <div className="min-h-screen flex">
      {/* Notificaciones */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="light"
      />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col">
          <div className="px-6 pt-6 space-y-6">

            {/* Modal Crear */}
            <CreatePurchaseOrderModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreatePurchaseOrder}
            />

            {/* Modal Ver */}
            <ViewPurchaseOrderModal
              isOpen={isViewModalOpen}
              onClose={closeModals}
              purchaseOrder={viewingPurchaseOrder}
            />

            {/* Tabla */}
            <PurchaseOrdersTable
              purchaseOrders={purchaseOrders}
              onView={handleView}
              onCreate={() => setIsCreateModalOpen(true)}
            />

          </div>
        </main>
      </div>
    </div>
  );
}