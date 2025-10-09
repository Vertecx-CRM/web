import { useState } from "react";
import { toast } from "react-toastify";
import { Sale } from "../types/typesSales";

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [cancelingSale, setCancelingSale] = useState<Sale | null>(null);

  // Crear venta
  const handleCreateSale = (sale: Sale) => {
    setSales((prev) => [...prev, sale]);
    setIsCreateModalOpen(false);
    toast.success("Venta creada con éxito ✅");
  };

  // Ver venta
  const handleView = (sale: Sale) => {
    setViewingSale(sale);
  };

  // Abrir modal de anulación desde tabla
  const openCancelModal = (sale: Sale) => {
    setCancelingSale(sale);
  };

  // Confirmar anulación: recibe id + motivo
  const confirmCancelSale = (id: string, motivo: string) => {
    setSales((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              estado: "Anulada",
              observaciones: s.observaciones
                ? `${s.observaciones} | Motivo: ${motivo}`
                : `Motivo: ${motivo}`,
            }
          : s
      )
    );
    toast.warning("Venta anulada ⚠️");
    setCancelingSale(null);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setViewingSale(null);
    setCancelingSale(null);
  };

  return {
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
  };
}

