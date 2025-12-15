'use client';

import React, { useState } from "react";
import { PurchaseOrdersTable } from "../orders/components/PurchaseOrdersTable/PurchaseOrdersTable";
import { EditPurchaseOrderModal } from "../orders/components/EditPurchaseOrderModal/EditPurchaseOrder";
import { ViewPurchaseOrderModal } from "../orders/components/ViewPurchaseOrderModal/viewPurchaseOrder";
import { CreatePurchaseOrderModal } from "../orders/components/CreatePurchaseOrderModal/CreatePurchaseOrder";
import { purchaseOrder, editPurchaseOrder } from "../orders/types/typesPurchaseOrder";
import { toast } from "react-toastify";

const PurchasesOrdersIndex: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<purchaseOrder[]>([
    {
      id: 1,
      numeroOrden: "ORD-001",
      proveedor: "Proveedor A",
      precioUnitario: 100000,
      fecha: "2025-01-15",
      estado: "Pendiente",
      cantidad: 5,
      total: 500000,
      descripcion: "Orden de ejemplo 1",
      monto: "",
      fechaCreacion: undefined
    },
    {
      id: 2,
      numeroOrden: "ORD-002",
      proveedor: "Proveedor B",
      precioUnitario: 250000,
      fecha: "2025-01-20",
      estado: "Completada",
      cantidad: 2,
      total: 500000,
      descripcion: "Orden de ejemplo 2",
      monto: "",
      fechaCreacion: undefined
    }
  ]);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<purchaseOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<editPurchaseOrder | null>(null);

  // Función para ver orden
  const handleView = (order: purchaseOrder) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  // Función para editar orden
  const handleEdit = (order: editPurchaseOrder) => {
    setEditingOrder(order);
    setEditModalOpen(true);
  };

  // Función para guardar edición
  const handleSaveEdit = (updatedOrder: editPurchaseOrder) => {
    setPurchaseOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
      )
    );
    setEditModalOpen(false);
    setEditingOrder(null);
    toast.success("Orden actualizada exitosamente");
  };

  // Función para crear nueva orden
  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  // Función para guardar nueva orden
  const handleSaveCreate = (newOrderData: any) => {
    const orderWithId: purchaseOrder = {
      ...newOrderData,
      id: purchaseOrders.length > 0 ? Math.max(...purchaseOrders.map(o => o.id || 0)) + 1 : 1,
      estado: "Pendiente",
      total: (newOrderData.precioUnitario || 0) * (newOrderData.cantidad || 0) * 1.19, // Incluye IVA
      monto: "",
      fechaCreacion: new Date().toISOString()
    };
    setPurchaseOrders(prevOrders => [...prevOrders, orderWithId]);
    setCreateModalOpen(false);
    toast.success("Orden creada exitosamente");
  };

  // Función para anular orden
  const handleCancel = (order: purchaseOrder, reason: string) => {
    setPurchaseOrders(prevOrders =>
      prevOrders.map(o =>
        o.id === order.id
          ? {
              ...o,
              estado: "Anulada",
              motivoAnulacion: reason,
              fechaAnulacion: new Date().toISOString(),
              usuarioAnulacion: "Usuario Actual"
            }
          : o
      )
    );
    toast.success(`Orden ${order.numeroOrden} anulada exitosamente`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Órdenes de Compra</h1>
      </div>
      
      <PurchaseOrdersTable
        purchaseOrders={purchaseOrders}
        onView={handleView}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onCancel={handleCancel}
      />

      {/* Modal de visualización */}
      <ViewPurchaseOrderModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedOrder(null);
        }}
        purchaseOrder={selectedOrder}
      />

      {/* Modal de edición */}
      <EditPurchaseOrderModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingOrder(null);
        }}
        onSave={handleSaveEdit}
        purchaseOrder={editingOrder}
      />

      {/* Modal de creación */}
      <CreatePurchaseOrderModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleSaveCreate}
      />
    </div>
  );
};

export default PurchasesOrdersIndex;