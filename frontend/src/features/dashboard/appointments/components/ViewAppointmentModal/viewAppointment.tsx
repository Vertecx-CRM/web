// components/appointments/components/ViewAppointmentModal/viewAppointment.tsx
import React from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { ViewAppointmentModalProps, Order } from "../../types/typeAppointment";
import { TechniciansTable } from "../techniciansTable";

// Asegúrate de importar la lista de órdenes desde tu mock
import { orders } from '../../mocks/mockAppointment';

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
                                        <div className="w-16 px-3 py-2 border rounded-md text-center " style={{ borderColor: Colors.table.lines }}>
                                            {appointment.horaFin}
                                        </div>
                                        <span>:</span>
                                        <div className="w-16 px-3 py-2 border rounded-md text-center " style={{ borderColor: Colors.table.lines }}>
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
                                    <div className="w-full px-3 py-2 border rounded-md text-center ">{appointment.mes}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Año</label>
                                    <div className="w-full px-3 py-2 border rounded-md text-center ">{appointment.año}</div>
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
                                                Motivo: {appointment.motivoCancelacion}
                                            </div>
                                        )}

                                        {appointment.horaCancelacion && (
                                            <div className="px-3 py-2 border rounded-md text-sm">
                                                Hora cancelación:{" "}
                                                {new Date(appointment.horaCancelacion).toLocaleTimeString("es-CO", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Columna derecha → datos de la orden */}
                        <div className="space-y-4 text-sm" style={{ color: Colors.texts.primary }}>
                            {/* Cliente */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: Colors.texts.primary }}
                                >
                                    Cliente
                                </label>
                                <div className="w-full px-3 py-2 border rounded-md" style={{ borderColor: Colors.table.lines }}>
                                    {cliente}
                                </div>
                            </div>

                            {/* Dirección */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: Colors.texts.primary }}
                                >
                                    Dirección
                                </label>
                                <div className="w-full px-3 py-2 border rounded-md" style={{ borderColor: Colors.table.lines }}>
                                    {lugar}
                                </div>
                            </div>

                            {/* Tipo de servicio */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: Colors.texts.primary }}
                                >
                                    Tipo de servicio
                                </label>
                                <div className="w-full px-3 py-2 border rounded-md" style={{ borderColor: Colors.table.lines }}>
                                    {tipoServicio}
                                </div>
                            </div>
                            
                            {/* Tipo de mantenimiento (solo si existe y es "mantenimiento") */}
                            {currentOrder?.tipoServicio === "mantenimiento" && (
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: Colors.texts.primary }}
                                    >
                                        Tipo de mantenimiento
                                    </label>
                                    <div className="w-full px-3 py-2 border rounded-md" style={{ borderColor: Colors.table.lines }}>
                                        {tipoMantenimiento}
                                    </div>
                                </div>
                            )}

                            {/* Monto */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: Colors.texts.primary }}
                                >
                                    Monto
                                </label>
                                <div className="w-full px-3 py-2 border rounded-md" style={{ borderColor: Colors.table.lines }}>
                                    ${monto}
                                </div>
                            </div>

                            {/* Evidencia */}
                            {appointment.evidencia && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Evidencia</label>
                                    <div className="mt-2">
                                        {appointment.evidencia.type?.startsWith("image/") ? (
                                            <img
                                                src={URL.createObjectURL(appointment.evidencia)}
                                                alt="Evidencia"
                                                className="max-w-full h-auto max-h-40 rounded-md border"
                                            />
                                        ) : appointment.evidencia.type?.startsWith("video/") ? (
                                            <video controls className="max-w-full h-auto max-h-40 rounded-md border">
                                                <source src={URL.createObjectURL(appointment.evidencia)} />
                                            </video>
                                        ) : (
                                            <div className="flex items-center space-x-2 p-2 border rounded-md">
                                                <span className="text-sm">{appointment.evidencia.name}</span>
                                                <a
                                                    href={URL.createObjectURL(appointment.evidencia)}
                                                    download={appointment.evidencia.name}
                                                    className="px-2 py-1 text-xs rounded text-white"
                                                    style={{ backgroundColor: Colors.buttons.quaternary }}
                                                >
                                                    Descargar
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Técnicos asignados */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Técnicos asignados</label>
                                <TechniciansTable technicians={appointment.tecnicos || []} onRemoveTechnician={() => { }} />
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