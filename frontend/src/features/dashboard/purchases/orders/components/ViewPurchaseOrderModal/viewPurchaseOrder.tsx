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
                month: '2-digit',
                day: '2-digit'
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
                        <h2 className="text-lg font-semibold text-gray-900">
                            Detalle Orden Compra
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Contenido */}
                    <div className="p-6 space-y-4">
                        {/* Primera fila: N° Orden y Estado */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1 text-gray-600">
                                    N° Orden
                                </label>
                                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm">
                                    {purchaseOrder.numeroOrden}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1 text-gray-600">
                                    Estado de Orden
                                </label>
                                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm">
                                    {purchaseOrder.estado}
                                </div>
                            </div>
                        </div>

                        {/* Segunda fila: Proveedor y Fecha de orden */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1 text-gray-600">
                                    Proveedor
                                </label>
                                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm">
                                    {purchaseOrder.proveedor}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1 text-gray-600">
                                    Fecha de orden
                                </label>
                                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm flex items-center justify-between">
                                    <span>{formatDate(purchaseOrder.fecha)}</span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Tabla de productos */}
                        <div>
                            <label className="block text-xs font-medium mb-2 text-gray-600">
                                Productos
                            </label>
                            <div className="border border-gray-300 rounded overflow-hidden">
                                {/* Header de tabla */}
                                <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-300">
                                    <div className="px-3 py-2 text-xs font-medium text-gray-600">Productos</div>
                                    <div className="px-3 py-2 text-xs font-medium text-gray-600 text-center">Cantidad</div>
                                    <div className="px-3 py-2 text-xs font-medium text-gray-600 text-right">Precio Unitario</div>
                                    <div className="px-3 py-2 text-xs font-medium text-gray-600 text-right">Total</div>
                                </div>
                                
                                {/* Fila de producto 1 */}
                                <div className="grid grid-cols-4 border-b border-gray-200 bg-white">
                                    <div className="px-3 py-3 text-sm text-gray-700">Monitor LG</div>
                                    <div className="px-3 py-3 text-sm text-gray-700 text-center">2</div>
                                    <div className="px-3 py-3 text-sm text-gray-700 text-right">$500,000</div>
                                    <div className="px-3 py-3 text-sm text-gray-700 text-right">$1,000,000</div>
                                </div>

                                {/* Fila de producto 2 */}
                                <div className="grid grid-cols-4 bg-white">
                                    <div className="px-3 py-3 text-sm text-gray-700">Servidor</div>
                                    <div className="px-3 py-3 text-sm text-gray-700 text-center">1</div>
                                    <div className="px-3 py-3 text-sm text-gray-700 text-right">$100,000</div>
                                    <div className="px-3 py-3 text-sm text-gray-700 text-right">$100,000</div>
                                </div>
                            </div>
                        </div>

                        {/* Resumen de totales - alineado a la derecha */}
                        <div className="flex justify-end">
                            <div className="w-64 space-y-2 text-sm">
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900">$1,100,000</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">IVA (19%)</span>
                                    <span className="text-gray-900">$209,000</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Descuento</span>
                                    <span className="text-gray-900">$0</span>
                                </div>
                                <div className="flex justify-between py-2 border-t border-gray-300 font-semibold">
                                    <span className="text-gray-900">TOTAL a pagar</span>
                                    <span className="text-gray-900">$1,309,000</span>
                                </div>
                            </div>
                        </div>

                        {/* Fecha estimada de entrega */}
                        <div>
                            <label className="block text-xs font-medium mb-1 text-gray-600">
                                Fecha estimada de entrega
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm flex items-center justify-between">
                                <span>03/06/2025</span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div>
                            <label className="block text-xs font-medium mb-1 text-gray-600">
                                Observaciones
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm min-h-[60px]">
                                {purchaseOrder.descripcion || ''}
                            </div>
                        </div>

                        {/* Botón */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 text-sm text-white bg-gray-500 hover:bg-gray-600 rounded font-medium"
                            >
                                Cancelar
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