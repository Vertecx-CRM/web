// components/calendars/EditAppointmentModal.tsx
import Colors from "@/shared/theme/colors";
import React from "react";
import { createPortal } from "react-dom";
import { appointmentStates, months, orders, technicians } from "../../mocks/mockAppointment";
import { TechniciansTable } from "../techniciansTable";
import { useEditAppointmentForm } from "../../hooks/useAppointment";
import { EditAppointmentModalProps } from "../../types/typeAppointment";

export const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
    isOpen,
    onClose,
    onSave,
    appointment
}) => {
    // Hook de edición
    const {
        formData,
        selectedTechnicians,
        evidencia,
        errors,
        technicianError,
        touched,
        handleInputChange,
        handleTimeChange,
        handleTechnicianSelect,
        removeTechnician,
        handleEvidenciaChange,
        handleBlur,
        handleSubmit,
        removeEvidencia,
        estado,
        handleEstadoChange
    } = useEditAppointmentForm({
        onClose,
        onSave,
        appointment,
    });

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
            <div
                className="p-4 rounded-lg shadow-lg w-full max-w-5xl relative z-50 mx-auto max-h-[95vh] flex flex-col"
                style={{ backgroundColor: Colors.table.primary }}
            >
                <button onClick={onClose} className="absolute top-3 right-3 z-10">
                    <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
                </button>

                <div
                    className="px-4 py-3 rounded-t-lg font-semibold text-2xl mb-4"
                    style={{ color: Colors.texts.primary }}
                >
                    Editar cita
                </div>

                <div
                    className="w-full h-0 outline outline-1 outline-offset-[-0.5px]"
                    style={{ outlineColor: Colors.texts.primary }}
                ></div>

                {/* Contenedor con scroll y dos columnas */}
                <div className="flex-1 overflow-y-auto p-4">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Columna izquierda */}
                        <div className="space-y-4">
                            {/* Hora de inicio y fin */}
                            <div className="flex space-x-4">
                                {/* Inicio */}
                                <div className="flex-1">
                                    <label
                                        className="block text-sm font-medium mb-2 "
                                        style={{ color: Colors.texts.primary }}
                                    >
                                        Hora de inicio
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="number"
                                            name="horaInicio"
                                            value={formData.horaInicio}
                                            onChange={handleTimeChange}
                                            onBlur={handleBlur}
                                            min="0"
                                            max="23"
                                            className={`w-16 px-3 py-2 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#CC0000] ${touched.horaInicio && errors.horaInicio
                                                ? "border-red-500"
                                                : "border-gray-300"
                                                }`}
                                            style={{ borderColor: Colors.table.lines }}
                                        />
                                        <span style={{ color: Colors.texts.primary }}>:</span>
                                        <input
                                            type="number"
                                            name="minutoInicio"
                                            value={formData.minutoInicio}
                                            onChange={handleTimeChange}
                                            onBlur={handleBlur}
                                            min="0"
                                            max="59"
                                            className={`w-16 px-3 py-2 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#CC0000] ${touched.minutoInicio && errors.minutoInicio
                                                ? "border-red-500"
                                                : "border-gray-300"
                                                }`}
                                            style={{ borderColor: Colors.table.lines }}
                                        />
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
                                        <input
                                            type="number"
                                            name="horaFin"
                                            value={formData.horaFin}
                                            onChange={handleTimeChange}
                                            onBlur={handleBlur}
                                            min="0"
                                            max="23"
                                            className={`w-16 px-3 py-2 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#CC0000] ${touched.horaFin && errors.horaFin
                                                ? "border-red-500"
                                                : "border-gray-300"
                                                }`}
                                            style={{ borderColor: Colors.table.lines }}
                                        />
                                        <span style={{ color: Colors.texts.primary }}>:</span>
                                        <input
                                            type="number"
                                            name="minutoFin"
                                            value={formData.minutoFin}
                                            onChange={handleTimeChange}
                                            onBlur={handleBlur}
                                            min="0"
                                            max="59"
                                            className={`w-16 px-3 py-2 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#CC0000] ${touched.minutoFin && errors.minutoFin
                                                ? "border-red-500"
                                                : "border-gray-300"
                                                }`}
                                            style={{ borderColor: Colors.table.lines }}
                                        />
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
                                    <input
                                        type="number"
                                        name="dia"
                                        value={formData.dia}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        min="1"
                                        max="31"
                                        className="w-full px-3 py-2 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                                        style={{ borderColor: Colors.table.lines }}
                                    />
                                </div>
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: Colors.texts.primary }}
                                    >
                                        Mes
                                    </label>
                                    <select
                                        name="mes"
                                        value={formData.mes}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                                        style={{ borderColor: Colors.table.lines }}
                                    >
                                        <option value="">Seleccionar mes</option>
                                        {Object.entries(months).map(([numero, nombre]) => (
                                            <option key={numero} value={numero}>
                                                {nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: Colors.texts.primary }}
                                    >
                                        Año
                                    </label>
                                    <input
                                        type="number"
                                        name="año"
                                        value={formData.año}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        min="2023"
                                        max="2030"
                                        className="w-full px-3 py-2 border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                                        style={{ borderColor: Colors.table.lines }}
                                    />
                                </div>
                            </div>

                            {/* Técnico */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: Colors.texts.primary }}
                                >
                                    Selecciona el técnico
                                </label>
                                <select
                                    name="tecnico"
                                    value=""
                                    onChange={handleTechnicianSelect}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                                    style={{ borderColor: Colors.table.lines }}
                                >
                                    <option value="">Seleccionar técnico</option>
                                    {technicians.map((tech) => (
                                        <option key={tech.id} value={tech.id}>
                                            {tech.nombre} - {tech.titulo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tabla técnicos seleccionados */}
                            <TechniciansTable
                                technicians={selectedTechnicians}
                                onRemoveTechnician={removeTechnician}
                            />

                            {/* Nro Orden */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: Colors.texts.primary }}
                                >
                                    Nro. Orden
                                </label>
                                <select
                                    name="orden"
                                    value={formData.orden ? formData.orden.id : ""}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                                    style={{ borderColor: Colors.table.lines }}
                                >
                                    <option value="">Seleccionar orden</option>
                                    {orders.map((orders) => (
                                        <option key={orders.id} value={orders.id}>
                                            {orders.id}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Columna derecha */}
                        <div className="space-y-4">
                            {/* Observaciones */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: Colors.texts.primary }}
                                >
                                    Observación
                                </label>
                                <textarea
                                    name="observaciones"
                                    placeholder="Ingrese sus observaciones"
                                    value={formData.observaciones}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                                    style={{ borderColor: Colors.table.lines }}
                                />
                            </div>

                            {/* Evidencia */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Evidencia (imagen o vídeo)
                                </label>

                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                            </svg>
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, MP4 o AVI (MAX. 10MB)
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            onChange={handleEvidenciaChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {evidencia && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {/* Icono según tipo de archivo */}
                                                {evidencia.type.startsWith('image/') ? (
                                                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                                    </svg>
                                                )}

                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                        {evidencia.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(evidencia.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={removeEvidencia}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                                title="Quitar archivo"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Vista previa para imágenes */}
                                        {evidencia.type.startsWith('image/') && (
                                            <div className="mt-3">
                                                <img
                                                    src={URL.createObjectURL(evidencia)}
                                                    alt="Vista previa"
                                                    className="h-40 object-contain rounded border border-gray-200"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Estado */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Estado</label>
                                <select
                                    name="estado"
                                    value={estado}
                                    onChange={handleEstadoChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                                    style={{ borderColor: Colors.table.lines }}
                                >
                                    {appointmentStates.map(state => (
                                        <option key={state.value} value={state.value}>
                                            {state.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Motivo de cancelación (solo si está Cancelado) */}
                            {estado === "Cancelado" && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Motivo de cancelación</label>
                                    <textarea
                                        name="motivoCancelacion"
                                        value={formData.motivoCancelacion}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        rows={3}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#CC0000] ${errors.motivoCancelacion ? "border-red-500" : "border-gray-300"}`}
                                        style={{ borderColor: Colors.table.lines }}
                                    />
                                    {errors.motivoCancelacion && (
                                        <p className="text-red-500 text-sm mt-1">{errors.motivoCancelacion}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Botones */}
                <div
                    className="p-4"
                    
                >
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-md font-medium transition-colors"
                            style={{
                                backgroundColor: Colors.buttons.secondary,
                                color: Colors.texts.quaternary
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-6 py-2 rounded-md font-medium transition-colors"
                            style={{
                                backgroundColor: Colors.buttons.quaternary,
                                color: Colors.texts.quaternary
                            }}
                        >
                            Guardar cambios
                        </button>
                    </div>
                    
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