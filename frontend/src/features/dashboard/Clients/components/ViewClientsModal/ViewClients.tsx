import React from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { ViewClientModalProps } from "../../types/typeClients";

export const ViewClientModal: React.FC<ViewClientModalProps> = ({
    isOpen,
    client,
    onClose,
}) => {
    if (!isOpen || !client) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
            <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-lg relative z-50 mx-auto">
                <button onClick={onClose} className="absolute top-3 right-3 z-10">
                    <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
                </button>

                <div className="px-4 py-3 rounded-t-lg text-black font-semibold text-2xl">
                    Ver Cliente
                </div>

                <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>

                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    
                    {/* ID */}
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                            ID
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            <span className="text-gray-700">{client.id}</span>
                        </div>
                    </div>

                    {/* Tipo */}
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                            Tipo
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            <span className="text-gray-700">{client.tipo}</span>
                        </div>
                    </div>

                    {/* Documento */}
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                            Documento
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            <span className="text-gray-700">{client.documento}</span>
                        </div>
                    </div>

                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                            Nombre
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            <span className="text-gray-700">{client.nombre}</span>
                        </div>
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                            Teléfono
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            <span className="text-gray-700">{client.telefono}</span>
                        </div>
                    </div>

                    {/* Correo Electrónico */}
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                            Correo Electrónico
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            <span className="text-gray-700">{client.correoElectronico}</span>
                        </div>
                    </div>

                    {/* Rol */}
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                            Rol
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            <span className="text-gray-700">{client.rol}</span>
                        </div>
                    </div>

                    {/* Estado */}
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                            Estado
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            <span
                                className="rounded-full px-2 py-0.5 text-xs font-medium"
                                style={{
                                    backgroundColor: client.estado === "Activo" ? "#e8f5e8" : "#f5e8e8",
                                    color: client.estado === "Activo" ? Colors.states.success : Colors.states.inactive,
                                }}
                            >
                                {client.estado}
                            </span>
                        </div>
                    </div>

                    {/* Botón de Cerrar */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md font-medium text-white text-sm"
                            style={{
                                backgroundColor: Colors.buttons.quaternary,
                                color: Colors.texts.quaternary,
                            }}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
                <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>
            </div>
        </div>,
        document.body
    );
};

export default ViewClientModal;