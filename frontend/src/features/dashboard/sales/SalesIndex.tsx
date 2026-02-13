"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/features/dashboard/components/datatable/DataTable";
import { Column } from "@/features/dashboard/components/datatable/types/column.types";
import Modal from "@/features/dashboard/components/Modal";
import { useLoader } from "@/shared/components/loader";
import { showSuccess, showError } from "@/shared/utils/notifications";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Colors from "@/shared/theme/colors";
import { ISale } from "./types/sales.type";
import { getSales, deleteSale, annulSale } from "./services/sales.service";
import CreateSaleForm from "./components/CreateSaleForm";
import SaleDetailModal from "./components/SaleDetailModal";

type SaleRow = {
  id: number;
  codigo: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: string;
};

export default function SalesIndex() {
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [viewSaleId, setViewSaleId] = useState<number | null>(null);
  const { showLoader, hideLoader } = useLoader();

  // ── Estado de Anulación ──
  const [isAnnulModalOpen, setAnnulModalOpen] = useState(false);
  const [saleToAnnul, setSaleToAnnul] = useState<SaleRow | null>(null);
  const [annulReason, setAnnulReason] = useState("");
  const [annulling, setAnnulling] = useState(false);

  // ── Cargar ventas reales desde la API ──
  const loadSales = useCallback(async () => {
    try {
      const data: ISale[] = await getSales();
      const mapped: SaleRow[] = data.map((s) => ({
        id: s.saleid,
        codigo: s.salecode,
        cliente: s.customer?.users
          ? `${s.customer.users.name} ${s.customer.users.lastname}`
          : `Cliente #${s.customerid}`,
        fecha: new Date(s.saledate).toLocaleDateString("es-CO"),
        total: s.totalamount,
        estado: s.salestatus === "Completed" ? "Finalizada"
          : s.salestatus === "Cancelled" ? "Anulada"
            : s.salestatus === "Pending" ? "Pendiente"
              : s.salestatus,
      }));
      setSales(mapped);
    } catch (err) {
      console.error(err);
      showError("Error al cargar las ventas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // ── Eliminar venta ──
  const handleDelete = async (row: SaleRow) => {
    if (!confirm(`¿Eliminar registro de venta "${row.codigo}"? Esto es irreversible.`)) return;
    showLoader();
    try {
      await deleteSale(row.id);
      setSales((prev) => prev.filter((s) => s.id !== row.id));
      showSuccess(`Venta "${row.codigo}" eliminada.`);
    } catch (err) {
      console.error(err);
      showError("Error al eliminar la venta.");
    } finally {
      hideLoader();
    }
  };

  // ── Abrir modal de anulación ──
  const handleOpenAnnul = (row: SaleRow) => {
    setSaleToAnnul(row);
    setAnnulReason("");
    setAnnulModalOpen(true);
  };

  // ── Confirmar anulación ──
  const handleConfirmAnnul = async () => {
    if (!saleToAnnul) return;
    if (!annulReason.trim()) {
      showError("Debe ingresar un motivo para la anulación.");
      return;
    }

    setAnnulling(true);
    try {
      // "Admin" is hardcoded for now as we don't have global auth context readily available in this file.
      await annulSale(saleToAnnul.id, annulReason, "Admin");
      showSuccess(`Venta ${saleToAnnul.codigo} anulada correctamente.`);
      setAnnulModalOpen(false);
      loadSales(); // Refresh
    } catch (err) {
      console.error(err);
      showError("Error al anular la venta.");
    } finally {
      setAnnulling(false);
    }
  };

  // ── Columnas de la tabla ──
  const columns: Column<SaleRow>[] = [
    {
      key: "id",
      header: "#",
      render: (row) => row.id.toString(),
    },
    { key: "codigo", header: "Código Venta" },
    { key: "cliente", header: "Cliente" },
    { key: "fecha", header: "Fecha" },
    {
      key: "total",
      header: "Total",
      render: (row) => `$${row.total.toLocaleString("es-CO")}`,
    },
    {
      key: "estado",
      header: "Estado",
      render: (row) => {
        let bgColor = "#f3f4f6";
        let textColor = Colors.states.inactive;

        if (row.estado === "Finalizada") {
          bgColor = "#e8f5e8";
          textColor = Colors.states.success;
        } else if (row.estado === "Pendiente") {
          bgColor = "#fff7ed"; // Orange-ish
          textColor = "#c2410c";
        } else if (row.estado === "Anulada") {
          bgColor = "#fef2f2"; // Red-ish
          textColor = "#ef4444";
        }

        return (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: bgColor, color: textColor }}
          >
            {row.estado}
          </span>
        );
      },
    },
  ];

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">Cargando ventas...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ToastContainer position="bottom-right" />

      <DataTable<SaleRow>
        data={sales}
        columns={columns}
        searchableKeys={["codigo", "cliente", "estado"]}
        pageSize={10}
        onView={(row) => setViewSaleId(row.id)}
        onDelete={handleDelete}
        // Custom extra action for Annul
        renderExtraActions={(row) => (
          row.estado === "Pendiente" ? (
            <button
              onClick={() => handleOpenAnnul(row)}
              className="p-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60 text-red-500"
              title="Anular Venta"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </button>
          ) : null
        )}
        onCreate={() => setCreateModalOpen(true)}
        createButtonText="Nueva Venta" module={"Sales"}      />

      {/* Modal para crear venta */}
      <Modal
        title="Registrar Nueva Venta"
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      >
        <CreateSaleForm
          onClose={() => setCreateModalOpen(false)}
          onSaved={() => {
            loadSales();
          }}
        />
      </Modal>

      {/* Modal Detalle de Venta */}
      <SaleDetailModal
        saleId={viewSaleId}
        onClose={() => setViewSaleId(null)}
      />


      {/* Modal para anular venta */}
      <Modal
        title="Anular Venta"
        isOpen={isAnnulModalOpen}
        onClose={() => setAnnulModalOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Está seguro de que desea anular la venta <span className="font-bold">{saleToAnnul?.codigo}</span>?
            Esta acción actualizará el inventario y cambiará el estado a "Anulada".
          </p>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Motivo de anulación *
            </label>
            <textarea
              rows={3}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Especifique la razón..."
              value={annulReason}
              onChange={(e) => setAnnulReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setAnnulModalOpen(false)}
              disabled={annulling}
              className="px-4 py-2 rounded-md font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmAnnul}
              disabled={annulling}
              className="px-4 py-2 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 flex items-center gap-2"
            >
              {annulling && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Confirmar Anulación
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}