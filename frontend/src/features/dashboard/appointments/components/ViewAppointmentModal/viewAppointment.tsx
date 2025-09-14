// components/appointments/components/ViewAppointmentModal/viewAppointment.tsx
import React from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { ViewAppointmentModalProps } from "../../types/typeAppointment";
import { TechniciansTable } from "../techniciansTable";

export const ViewAppointmentModal: React.FC<ViewAppointmentModalProps> = ({
    isOpen,
    onClose,
    appointment,
}) => {
    if (!isOpen || !appointment) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
            <div
                className="p-4 rounded-lg shadow-lg w-full max-w-4xl relative z-50 mx-auto max-h-[100vh] flex flex-col"
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
                    Detalles de la cita
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
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: Colors.texts.primary }}
                                    >
                                        Hora de inicio
                                    </label>
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
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: Colors.texts.primary }}
                                    >
                                        Hora final
                                    </label>
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
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: Colors.texts.primary }}
                                    >
                                        Día
                                    </label>
                                    <div className="w-full px-3 py-2 border rounded-md text-center" style={{ borderColor: Colors.table.lines }}>
                                        {appointment.dia}
                                    </div>
                                </div>
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: Colors.texts.primary }}
                                    >
                                        Mes
                                    </label>
                                    <div className="w-full px-3 py-2 border rounded-md text-center " style={{ borderColor: Colors.table.lines }}>
                                        {appointment.mes}
                                    </div>
                                </div>
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: Colors.texts.primary }}
                                    >
                                        Año
                                    </label>
                                    <div className="w-full px-3 py-2 border rounded-md text-center " style={{ borderColor: Colors.table.lines }}>
                                        {appointment.año}
                                    </div>
                                </div>
                            </div>

                            {/* Nro Orden */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: Colors.texts.primary }}
                                >
                                    Nro. Orden
                                </label>
                                <div className="w-full px-3 py-2 border rounded-md " style={{ borderColor: Colors.table.lines }}>
                                    {appointment.orden}
                                </div>
                            </div>

                            {/* Observaciones - TEXTO CORREGIDO */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: Colors.texts.primary }}
                                >
                                    Observación
                                </label>
                                <div
                                    className="w-full px-3 py-2 border rounded-md min-h-[80px] overflow-y-auto break-words"
                                    style={{
                                        borderColor: Colors.table.lines,
                                        maxHeight: '120px'
                                    }}
                                >
                                    {appointment.observaciones || "N/A"}
                                </div>
                            </div>

                            {/* Evidencia */}
                            {"evidencia" in appointment && (appointment as any).evidencia && (
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
                                        Evidencia
                                    </label>
                                    <div className="mt-2">
                                        {(appointment as any).evidencia.type?.startsWith('image/') ? (
                                            <img
                                                src={URL.createObjectURL((appointment as any).evidencia)}
                                                alt="Evidencia"
                                                className="max-w-full h-auto max-h-40 rounded-md border"
                                                style={{ borderColor: Colors.table.lines }}
                                            />
                                        ) : (appointment as any).evidencia.type?.startsWith('video/') ? (
                                            <video
                                                controls
                                                className="max-w-full h-auto max-h-40 rounded-md border"
                                                style={{ borderColor: Colors.table.lines }}
                                            >
                                                <source src={URL.createObjectURL((appointment as any).evidencia)} />
                                                Tu navegador no soporta el elemento de video.
                                            </video>
                                        ) : (
                                            <div className="flex items-center space-x-2 p-2 border rounded-md" style={{ borderColor: Colors.table.lines }}>
                                                <span className="text-sm">{(appointment as any).evidencia.name}</span>
                                                <a
                                                    href={URL.createObjectURL((appointment as any).evidencia)}
                                                    download={(appointment as any).evidencia.name}
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

                            {/* Estado */}
                            {/* Estado */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: Colors.texts.primary }}
                                >
                                    Estado
                                </label>
                                <div
                                    className="w-full px-3 py-2 border rounded-md"
                                    style={{ borderColor: Colors.table.lines }}
                                >
                                    {(appointment as any).estado || "Sin estado"}
                                </div>

                                {/* Si está cancelado → mostrar motivo y hora */}
                                {(appointment as any).estado === "Cancelado" && (
                                    <div className="mt-2 space-y-2">
                                        {(appointment as any).motivoCancelacion && (
                                            <div
                                                className="px-3 py-2 border rounded-md text-sm italic"
                                                style={{ borderColor: Colors.table.lines }}
                                            >
                                                Motivo: {(appointment as any).motivoCancelacion}
                                            </div>
                                        )}

                                        {(appointment as any).horaCancelacion && (
                                            <div
                                                className="px-3 py-2 border rounded-md text-sm"
                                                style={{ borderColor: Colors.table.lines }}
                                            >
                                                Hora cancelación:{" "}
                                                {new Date((appointment as any).horaCancelacion).toLocaleTimeString(
                                                    "es-CO",
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Columna derecha → tabla de técnicos */}
                        <div>
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: Colors.texts.primary }}
                            >
                                Técnicos asignados
                            </label>
                            <TechniciansTable
                                technicians={appointment.tecnicos || []}
                                onRemoveTechnician={() => { }} // Solo visualización
                            />
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div
                    className="p-4 flex justify-end"
                >
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