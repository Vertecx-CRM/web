"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePurchaseOrders } from "./hooks/usePurchaseOrders";
import CreatePurchaseOrderModal from "./components/CreatePurchaseOrderModal/CreatePurchaseOrder";
import PurchaseOrdersTable from "./components/PurchaseOrdersTable/PurchaseOrdersTable";
import EditPurchaseOrderModal from "./components/EditPurchaseOrderModal/EditPurchaseOrder";
import ViewPurchaseOrderModal from "./components/ViewPurchaseOrderModal/viewPurchaseOrder";
import { AnnulPurchaseOrderModal } from "./components/AnnulPurchaseOrderModal/AnnulPurchaseOrderModal";

export default function PurchaseOrdersIndex() {
  const {
    purchaseOrders,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingPurchaseOrder,
    viewingPurchaseOrder,
    annulingPurchaseOrder,
    handleCreatePurchaseOrder,
    handleEditPurchaseOrder,
    confirmAnnulPurchaseOrder,
    handleView,
    handleEdit,
    handleAnnul,
    closeModals
  } = usePurchaseOrders();

  // Determinar si los modales están abiertos basado en el estado
  const isEditModalOpen = !!editingPurchaseOrder;
  const isViewModalOpen = !!viewingPurchaseOrder;
  const isAnnulModalOpen = !!annulingPurchaseOrder;

  return (
    <div className="min-h-screen flex">
      {/* Toast Container para mostrar notificaciones */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col">
          <div className="px-6 pt-6">
            <CreatePurchaseOrderModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreatePurchaseOrder}
            />

            <EditPurchaseOrderModal
              isOpen={isEditModalOpen}
              onClose={closeModals}
              onSave={handleEditPurchaseOrder}
              purchaseOrder={editingPurchaseOrder}
            />

            <ViewPurchaseOrderModal
              isOpen={isViewModalOpen}
              onClose={closeModals}
              purchaseOrder={viewingPurchaseOrder}
            />

            <AnnulPurchaseOrderModal
              isOpen={isAnnulModalOpen}
              onClose={closeModals}
              onAnnul={confirmAnnulPurchaseOrder}
              purchaseOrder={annulingPurchaseOrder}
            />

            <PurchaseOrdersTable
              purchaseOrders={purchaseOrders}
              onView={handleView}
              onEdit={handleEdit}
              onAnnul={handleAnnul}
              onCreate={() => setIsCreateModalOpen(true)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}