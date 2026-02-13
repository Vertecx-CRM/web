import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { annulPurchaseOrderModalProps } from "../../types/typesPurchaseOrder";

export const AnnulPurchaseOrderModal: React.FC<annulPurchaseOrderModalProps> = ({
    isOpen,
    purchaseOrder,
    onClose,
    onAnnul,
}) => {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !purchaseOrder) return null;

    const handleSubmit = () => {
        if (!reason.trim()) return;
        setIsSubmitting(true);
        // Simulate API call delay if needed
        setTimeout(() => {
            if (purchaseOrder.id) {
                onAnnul(purchaseOrder.id, reason);
            }
            setIsSubmitting(false);
            setReason("");
            onClose();
        }, 500);
    };

    const today = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl p-6"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b pb-4 mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Anular Orden De Compra
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                X
                            </button>
                        </div>

                        {/* Order Details */}
                        <div className="space-y-2 text-sm mb-6">
                            <div className="grid grid-cols-[120px_1fr] items-center">
                                <span className="font-semibold text-gray-700">N° Orden</span>
                                <span className="text-gray-600">{purchaseOrder.numeroOrden}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center">
                                <span className="font-semibold text-gray-700">Proveedor:</span>
                                <span className="text-gray-600">{purchaseOrder.proveedor}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center">
                                <span className="font-semibold text-gray-700">Fecha emisión</span>
                                <span className="text-gray-600">{purchaseOrder.fecha}</span>
                            </div>
                        </div>

                        {/* Reason Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Motivo de anulación
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Escriba el motivo..."
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none transition-shadow"
                            />
                        </div>

                        {/* Footer Info */}
                        <div className="flex justify-between text-sm text-gray-500 mb-6">
                            <div className="text-center">
                                <div className="font-medium text-gray-900">Usuario que anula</div>
                                <div>Automatico</div>
                            </div>
                            <div className="text-center">
                                <div className="font-medium text-gray-900">Fecha emisión</div>
                                <div>{today}</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <button
                                onClick={onClose}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!reason.trim() || isSubmitting}
                                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? "Anulando..." : "Anular Orden"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};