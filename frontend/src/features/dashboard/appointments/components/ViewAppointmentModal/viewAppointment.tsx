// components/appointments/components/ViewAppointmentModal/viewAppointment.tsx
import React from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { ViewAppointmentModalProps, Order } from "../../types/typeAppointment";
import { TechniciansTable } from "../techniciansTable";

export const ViewAppointmentModal: React.FC<ViewAppointmentModalProps> = ({
    isOpen,
    onClose,
    appointment,
}) => {
    if (!isOpen || !appointment) return null;

    // 🔹 Lógica corregida para resolver la orden
    let currentOrder: Order | null = null;
    if (typeof appointment.orden === 'string') {
        currentOrder = orders.find((o) => o.id === appointment.orden) || null;
    } else {
        currentOrder = appointment.orden || null;
    }

    // Define las variables para los datos de la orden
    const cliente = currentOrder?.cliente || "N/A";
    const lugar = currentOrder?.lugar || "N/A";
    const tipoServicio = currentOrder?.tipoServicio || "N/A";
    const tipoMantenimiento = currentOrder?.tipoMantenimiento || "";
    const monto = currentOrder?.monto?.toLocaleString("es-CO") || "0";

    // Función para renderizar archivos (evidencia y comprobante)
    const renderFilePreview = (file: File | string | null, tipo: 'evidencia' | 'comprobante') => {
        if (!file) return null;

        const isImage = (fileName: string) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
        const isPDF = (fileName: string) => /\.pdf$/i.test(fileName);
        const isVideo = (fileName: string) => /\.(mp4|avi|mov|wmv)$/i.test(fileName);

        // Si es un File object
        if (file instanceof File) {
            if (isImage(file.name)) {
                return (
                    <div className="mt-2">
                        <img
                            src={URL.createObjectURL(file)}
                            alt={`${tipo} del trabajo`}
                            className="max-w-full h-auto max-h-40 rounded-md border"
                        />
                        <p className="text-sm text-gray-600 mt-1">{file.name}</p>
                    </div>
                );
            } else if (isVideo(file.name)) {
                return (
                    <div className="mt-2">
                        <video controls className="max-w-full h-auto max-h-40 rounded-md border">
                            <source src={URL.createObjectURL(file)} />
                            Tu navegador no soporta el elemento de video.
                        </video>
                        <p className="text-sm text-gray-600 mt-1">{file.name}</p>
                    </div>
                );
            } else if (isPDF(file.name)) {
                return (
                    <div className="mt-2 flex items-center space-x-2 p-2 border rounded-md">
                        <div className="h-10 w-10 bg-red-100 rounded flex items-center justify-center">
                            <span className="text-red-600 font-medium text-sm">PDF</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">
                                Tamaño: {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <a
                            href={URL.createObjectURL(file)}
                            download={file.name}
                            className="px-3 py-1 text-xs rounded text-white"
                            style={{ backgroundColor: Colors.buttons.quaternary }}
                        >
                            Descargar
                        </a>
                    </div>
                );
            } else {
                return (
                    <div className="mt-2 flex items-center space-x-2 p-2 border rounded-md">
                        <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-sm">DOC</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">
                                Tamaño: {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <a
                            href={URL.createObjectURL(file)}
                            download={file.name}
                            className="px-3 py-1 text-xs rounded text-white"
                            style={{ backgroundColor: Colors.buttons.quaternary }}
                        >
                            Descargar
                        </a>
                    </div>
                );
            }
        } 
        // Si es un string (URL/base64)
        else {
            if (file.startsWith('data:image') || isImage(file)) {
                return (
                    <div className="mt-2">
                        <img
                            src={file}
                            alt={`${tipo} del trabajo`}
                            className="max-w-full h-auto max-h-40 rounded-md border"
                        />
                    </div>
                );
            } else if (file.startsWith('data:video') || isVideo(file)) {
                return (
                    <div className="mt-2">
                        <video controls className="max-w-full h-auto max-h-40 rounded-md border">
                            <source src={file} />
                            Tu navegador no soporta el elemento de video.
                        </video>
                    </div>
                );
            } else if (file.includes('pdf') || isPDF(file)) {
                return (
                    <div className="mt-2 flex items-center space-x-2 p-2 border rounded-md">
                        <div className="h-10 w-10 bg-red-100 rounded flex items-center justify-center">
                            <span className="text-red-600 font-medium text-sm">PDF</span>
                        </div>
                        <span className="text-sm font-medium">Documento PDF</span>
                        <a
                            href={file}
                            download={`${tipo}-${appointment.id}`}
                            className="px-3 py-1 text-xs rounded text-white ml-auto"
                            style={{ backgroundColor: Colors.buttons.quaternary }}
                        >
                            Descargar
                        </a>
                    </div>
                );
            } else {
                return (
                    <div className="mt-2 flex items-center space-x-2 p-2 border rounded-md">
                        <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-sm">ARCH</span>
                        </div>
                        <span className="text-sm font-medium">Archivo adjunto</span>
                        <a
                            href={file}
                            download={`${tipo}-${appointment.id}`}
                            className="px-3 py-1 text-xs rounded text-white ml-auto"
                            style={{ backgroundColor: Colors.buttons.quaternary }}
                        >
                            Descargar
                        </a>
                    </div>
                );
            }
        }
    };

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
            <div
                className="p-4 rounded-lg shadow-lg w-full max-w-5xl relative z-50 mx-auto max-h-[100vh] flex flex-col"
                style={{ backgroundColor: Colors.table.primary }}
            >
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10"
                >
                    <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
                </button>

                {/* Título */}
                <div
                    className="px-4 py-3 rounded-t-lg font-semibold text-2xl mb-4"
                    style={{ color: Colors.texts.primary }}
                >
                    Detalles de la cita y orden
                </div>

                <div
                    className="w-full h-0 outline outline-1 outline-offset-[-0.5px]"
                    style={{ outlineColor: Colors.texts.primary }}
                ></div>

                {/* Contenedor con scroll y dos columnas */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Columna izquierda → datos de la cita */}
                        <div className="space-y-4 text-sm" style={{ color: Colors.texts.primary }}>
                            {/* Información básica de la cita */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Título</label>
                                <div className="w-full px-3 py-2 border rounded-md" style={{ borderColor: Colors.table.lines }}>
                                    {appointment.title || "N/A"}
                                </div>
                            </div>

                            {/* Tipo de cita */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Tipo de Cita</label>
                                <div className="w-full px-3 py-2 border rounded-md" style={{ borderColor: Colors.table.lines }}>
                                    {appointment.tipoCita || "N/A"}
                                </div>
                            </div>

                            {/* Hora de inicio y fin */}
                            <div className="flex space-x-4">
                                {/* Inicio */}
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-2">Hora de inicio</label>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-16 px-3 py-2 border rounded-md text-center" style={{ borderColor: Colors.table.lines }}>
                                            {appointment.horaInicio}
                                        </div>
                                        <span>:</span>
                                        <div className="w-16 px-3 py-2 border rounded-md text-center" style={{ borderColor: Colors.table.lines }}>
                                            {appointment.minutoInicio}
                                        </div>
                                    </div>
                                </div>

                                {/* Fin */}
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-2">Hora final</label>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-16 px-3 py-2 border rounded-md text-center" style={{ borderColor: Colors.table.lines }}>
                                            {appointment.horaFin}
                                        </div>
                                        <span>:</span>
                                        <div className="w-16 px-3 py-2 border rounded-md text-center" style={{ borderColor: Colors.table.lines }}>
                                            {appointment.minutoFin}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fecha */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Día</label>
                                    <div className="w-full px-3 py-2 border rounded-md text-center">{appointment.dia}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Mes</label>
                                    <div className="w-full px-3 py-2 border rounded-md text-center">{appointment.mes}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Año</label>
                                    <div className="w-full px-3 py-2 border rounded-md text-center">{appointment.año}</div>
                                </div>
                            </div>
                            
                            {/* Observación de la cita */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Observación</label>
                                <div className="w-full px-3 py-2 border rounded-md min-h-[80px] overflow-y-auto break-words max-h-[120px]">
                                    {appointment.observaciones || "N/A"}
                                </div>
                            </div>

                            {/* Estado de la cita */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Estado</label>
                                <div className="w-full px-3 py-2 border rounded-md">{appointment.estado || "Sin estado"}</div>

                                {/* Si está cancelado → mostrar motivo y hora */}
                                {appointment.estado === "Cancelado" && (
                                    <div className="mt-2 space-y-2">
                                        {appointment.motivoCancelacion && (
                                            <div className="px-3 py-2 border rounded-md text-sm italic">
                                                <strong>Motivo:</strong> {appointment.motivoCancelacion}
                                            </div>
                                        )}

                                        {appointment.horaCancelacion && (
                                            <div className="px-3 py-2 border rounded-md text-sm">
                                                <strong>Hora cancelación:</strong>{" "}
                                                {new Date(appointment.horaCancelacion).toLocaleTimeString("es-CO", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Evidencia del trabajo */}
                            {appointment.evidencia && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Evidencia del Trabajo</label>
                                    {renderFilePreview(appointment.evidencia, 'evidencia')}
                                </div>
                            )}
                        </div>

                        {/* Columna derecha → datos de la orden y técnicos */}
                        <div className="space-y-4 text-sm" style={{ color: Colors.texts.primary }}>
                            {/* Información de la orden */}
                            <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
                                <h3 className="font-medium text-blue-800 mb-2">Información de la Orden</h3>
                                
                                {/* Cliente */}
                                <div className="mb-2">
                                    <label className="block text-xs font-medium text-blue-700">Cliente</label>
                                    <div className="text-sm text-blue-900">{cliente}</div>
                                </div>

                                {/* Dirección */}
                                <div className="mb-2">
                                    <label className="block text-xs font-medium text-blue-700">Dirección</label>
                                    <div className="text-sm text-blue-900">{lugar}</div>
                                </div>

                                {/* Tipo de servicio */}
                                <div className="mb-2">
                                    <label className="block text-xs font-medium text-blue-700">Tipo de servicio</label>
                                    <div className="text-sm text-blue-900">{tipoServicio}</div>
                                </div>
                                
                                {/* Tipo de mantenimiento (solo si existe y es "mantenimiento") */}
                                {currentOrder?.tipoServicio === "mantenimiento" && (
                                    <div className="mb-2">
                                        <label className="block text-xs font-medium text-blue-700">Tipo de mantenimiento</label>
                                        <div className="text-sm text-blue-900">{tipoMantenimiento}</div>
                                    </div>
                                )}

                                {/* Monto */}
                                <div className="mb-2">
                                    <label className="block text-xs font-medium text-blue-700">Monto</label>
                                    <div className="text-sm text-blue-900">${monto} COP</div>
                                </div>
                            </div>

                            {/* Comprobante de pago (solo para citas de tipo solicitud) */}
                            {appointment.tipoCita === "solicitud" && appointment.comprobantePago && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Comprobante de Pago</label>
                                    {renderFilePreview(appointment.comprobantePago, 'comprobante')}
                                </div>
                            )}

                            {/* Información adicional para solicitudes */}
                            {appointment.tipoCita === "solicitud" && (
                                <div className="p-3 rounded-md bg-green-50 border border-green-200">
                                    <h3 className="font-medium text-green-800 mb-2">Información de Solicitud</h3>
                                    {appointment.nombreCliente && (
                                        <div className="mb-1">
                                            <label className="block text-xs font-medium text-green-700">Cliente:</label>
                                            <div className="text-sm text-green-900">{appointment.nombreCliente}</div>
                                        </div>
                                    )}
                                    {appointment.direccion && (
                                        <div className="mb-1">
                                            <label className="block text-xs font-medium text-green-700">Dirección:</label>
                                            <div className="text-sm text-green-900">{appointment.direccion}</div>
                                        </div>
                                    )}
                                    {appointment.servicio && (
                                        <div className="mb-1">
                                            <label className="block text-xs font-medium text-green-700">Servicio:</label>
                                            <div className="text-sm text-green-900">{appointment.servicio}</div>
                                        </div>
                                    )}
                                    {appointment.descripcion && (
                                        <div>
                                            <label className="block text-xs font-medium text-green-700">Descripción:</label>
                                            <div className="text-sm text-green-900">{appointment.descripcion}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Técnicos asignados */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Técnicos asignados</label>
                                <TechniciansTable 
                                    technicians={appointment.tecnicos || []} 
                                    onRemoveTechnician={() => { }} 
                                />
                            </div>

                            {/* Fechas de creación y actualización */}
                            <div className="p-3 rounded-md bg-gray-50 border border-gray-200">
                                <h3 className="font-medium text-gray-800 mb-2">Información de la Cita</h3>
                                <div className="space-y-1 text-xs text-gray-600">
                                    <div>
                                        <strong>Fecha de inicio:</strong>{" "}
                                        {appointment.start ? new Date(appointment.start).toLocaleString("es-CO") : "N/A"}
                                    </div>
                                    <div>
                                        <strong>Fecha de fin:</strong>{" "}
                                        {appointment.end ? new Date(appointment.end).toLocaleString("es-CO") : "N/A"}
                                    </div>
                                    <div>
                                        <strong>ID de cita:</strong> {appointment.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="p-4 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-md font-medium transition-colors"
                        style={{
                            backgroundColor: Colors.buttons.secondary,
                            color: Colors.texts.quaternary,
                        }}
                    >
                        Cerrar
                    </button>
                </div>
                <div
                    className="w-full h-0 outline outline-1 outline-offset-[-0.5px]"
                    style={{ outlineColor: Colors.texts.primary }}
                ></div>
            </div>
        </div>,
        document.body
    );
};