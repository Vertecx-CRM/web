import React from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { purchaseOrder, viewPurchaseOrderModalProps } from "../../types/typesPurchaseOrder";

export const ViewPurchaseOrderModal: React.FC<viewPurchaseOrderModalProps> = ({
    isOpen,
    onClose,
    purchaseOrder,
}) => {
    if (!isOpen || !purchaseOrder) return null;

    // Calcular totales
    const cantidad = purchaseOrder.cantidad || 1;
    const precioUnitario = purchaseOrder.precioUnitario || 0;
    const subtotal = cantidad * precioUnitario;
    const iva = subtotal * 0.19; // 19% IVA
    const descuento = 0; // Por ahora sin descuento
    const total = subtotal + iva - descuento;

    // Función para formatear fecha
    const formatDate = (dateString: string) => {
        if (!dateString) return 'No especificada';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    // Función para obtener color del estado
    const getStateColor = (estado: string) => {
        switch (estado) {
            case 'Completada':
                return Colors.states.success;
            case 'Pendiente':
                return Colors.states.warning;
            case 'Cancelada':
                return Colors.states.error;
            case 'En Proceso':
                return Colors.states.info;
            default:
                return Colors.states.inactive;
        }
    };

    return createPortal(
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative z-50 max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Ver Orden de Compra
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Contenido */}
                    <div className="p-6 space-y-6">
                        {/* Información principal */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    Número de Orden
                                </label>
                                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                                    {purchaseOrder.numeroOrden}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    Estado
                                </label>
                                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                                    <span 
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                        style={{ 
                                            color: getStateColor(purchaseOrder.estado),
                                            backgroundColor: `${getStateColor(purchaseOrder.estado)}20`
                                        }}
                                    >
                                        {purchaseOrder.estado}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Proveedor y Fecha */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    Proveedor
                                </label>
                                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                                    {purchaseOrder.proveedor}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    Fecha de Entrega
                                </label>
                                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                                    {formatDate(purchaseOrder.fecha)}
                                </div>
                            </div>
                        </div>

                        {/* Detalles del producto */}
                        <div className="bg-gray-50 p-4 rounded-md">
                            <h3 className="text-sm font-medium text-gray-700 mb-4">Detalles del Producto</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-600">
                                        Cantidad
                                    </label>
                                    <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md">
                                        {cantidad}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-600">
                                        Precio Unitario
                                    </label>
                                    <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md">
                                        ${precioUnitario.toLocaleString('es-CO')}
                                    </div>
                                </div>
                            </div>

                            {/* Resumen financiero */}
                            <div className="bg-white p-4 rounded border">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Resumen Financiero</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">${subtotal.toLocaleString('es-CO')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">IVA (19%):</span>
                                        <span className="font-medium">${iva.toLocaleString('es-CO')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Descuento:</span>
                                        <span className="font-medium">$0</span>
                                    </div>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-gray-900">TOTAL:</span>
                                            <span className="font-bold text-lg text-gray-900">
                                                ${total.toLocaleString('es-CO')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Observaciones */}
                        {purchaseOrder.descripcion && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    Observaciones
                                </label>
                                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md min-h-[60px]">
                                    {purchaseOrder.descripcion}
                                </div>
                            </div>
                        )}

                        {/* Información adicional */}
                        <div className="bg-blue-50 p-4 rounded-md">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">Información Adicional</h4>
                            <div className="text-sm text-blue-700 space-y-1">
                                <p><strong>ID de la Orden:</strong> #{purchaseOrder.id}</p>
                                <p><strong>Total calculado:</strong> ${(purchaseOrder.total || total).toLocaleString('es-CO')}</p>
                            </div>
                        </div>

                        {/* Botón */}
                        <div className="flex justify-end pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

export default ViewPurchaseOrderModal;