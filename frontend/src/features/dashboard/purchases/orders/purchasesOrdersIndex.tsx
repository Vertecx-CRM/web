
"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePurchaseOrders } from "./hooks/usePurchaseOrders";
import CreatePurchaseOrderModal from "./components/CreatePurchaseOrderModal/CreatePurchaseOrder";
import PurchaseOrdersTable from "./components/PurchaseOrdersTable/PurchaseOrdersTable";
import EditPurchaseOrderModal from "./components/EditPurchaseOrderModal/EditPurchaseOrder";
import ViewPurchaseOrderModal from "./components/ViewPurchaseOrderModal/viewPurchaseOrder";

export default function PurchaseOrdersIndex() {
  const {
    purchaseOrders,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingPurchaseOrder,
    viewingPurchaseOrder,
    handleCreatePurchaseOrder,
    handleEditPurchaseOrder,
    handleView,
    handleEdit,
    handleDelete, 
    closeModals
  } = usePurchaseOrders();

  // Determinar si los modales están abiertos basado en el estado
  const isEditModalOpen = !!editingPurchaseOrder;
  const isViewModalOpen = !!viewingPurchaseOrder;

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

            {/* NO necesitas DeleteConfirmation modal aquí */}
            {/* SweetAlert2 se encargará del modal de confirmación */}

            <PurchaseOrdersTable
              purchaseOrders={purchaseOrders}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={() => setIsCreateModalOpen(true)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}