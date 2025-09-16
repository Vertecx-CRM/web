// components/calendars/CreateAppointmentModal.tsx
import React from "react";
import { createPortal } from "react-dom";
import { CreateAppointmentModalProps } from "../../types/typeAppointment";
import { orders, technicians, months } from "../../mocks/mockAppointment";

import Colors from "@/shared/theme/colors";
import { useCreateAppointmentForm } from "../../hooks/useAppointment";
import { TechniciansTable } from "../techniciansTable";

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
    isOpen,
    onClose,
    onSave,
    selectedDateTime
}) => {
    // Usar el hook de formulario de creación de citas
    const {
        formData,
        selectedTechnicians,
        errors,
        technicianError,
        touched,
        handleInputChange,
        handleTimeChange,
        handleTechnicianSelect,
        removeTechnician,
        handleBlur,
        handleSubmit
    } = useCreateAppointmentForm({
        isOpen,
        onClose,
        onSave,
        selectedDateTime
    });

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
            <div
                className="p-4 rounded-lg shadow-lg w-full max-w-md relative z-50 mx-auto max-h-[100vh] flex flex-col"
                style={{ backgroundColor: Colors.table.primary }}
            >
                <button onClick={onClose} className="absolute top-3 right-3 z-10">
                    <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
                </button>

                <div className="px-4 py-3 rounded-t-lg font-semibold text-2xl mb-4" style={{ color: Colors.texts.primary }}>
                    Crear cita
                </div>

                <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px]" style={{ outlineColor: Colors.texts.primary }}></div>

                {/* Contenedor con scroll */}
                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        {/* Contenedor para horas en línea horizontal */}
                        <div className="flex space-x-4">
                            {/* Hora de inicio (izquierda) */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
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
                                        className={`w-16 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-center ${touched.horaInicio && errors.horaInicio
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-[#CC0000]'
                                            }`}
                                        placeholder="00"
                                        style={{
                                            borderColor: touched.horaInicio && errors.horaInicio
                                                ? Colors.states.inactive
                                                : Colors.table.lines,
                                            backgroundColor: 'white'
                                        }}
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
                                        className={`w-16 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-center ${touched.minutoInicio && errors.minutoInicio
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-[#CC0000]'
                                            }`}
                                        placeholder="00"
                                        style={{
                                            borderColor: touched.minutoInicio && errors.minutoInicio
                                                ? Colors.states.inactive
                                                : Colors.table.lines,
                                            backgroundColor: 'white'
                                        }}
                                    />
                                </div>
                                {touched.horaInicio && errors.horaInicio && (
                                    <p className="text-xs mt-1" style={{ color: Colors.states.inactive }}>
                                        {errors.horaInicio}
                                    </p>
                                )}
                                {touched.minutoInicio && errors.minutoInicio && (
                                    <p className="text-xs mt-1" style={{ color: Colors.states.inactive }}>
                                        {errors.minutoInicio}
                                    </p>
                                )}
                            </div>

                            {/* Hora final (derecha) */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
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
                                        className={`w-16 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-center ${touched.horaFin && errors.horaFin
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-[#CC0000]'
                                            }`}
                                        placeholder="00"
                                        style={{
                                            borderColor: touched.horaFin && errors.horaFin
                                                ? Colors.states.inactive
                                                : Colors.table.lines,
                                            backgroundColor: 'white'
                                        }}
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
                                        className={`w-16 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-center ${touched.minutoFin && errors.minutoFin
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-[#CC0000]'
                                            }`}
                                        placeholder="00"
                                        style={{
                                            borderColor: touched.minutoFin && errors.minutoFin
                                                ? Colors.states.inactive
                                                : Colors.table.lines,
                                            backgroundColor: 'white'
                                        }}
                                    />
                                </div>
                                {touched.horaFin && errors.horaFin && (
                                    <p className="text-xs mt-1" style={{ color: Colors.states.inactive }}>
                                        {errors.horaFin}
                                    </p>
                                )}
                                {touched.minutoFin && errors.minutoFin && (
                                    <p className="text-xs mt-1" style={{ color: Colors.states.inactive }}>
                                        {errors.minutoFin}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Día, Mes, Año */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
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
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-center ${touched.dia && errors.dia
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-[#CC0000]'
                                        }`}
                                    placeholder="DD"
                                    style={{
                                        borderColor: touched.dia && errors.dia
                                            ? Colors.states.inactive
                                            : Colors.table.lines,
                                        backgroundColor: 'white'
                                    }}
                                />
                                {touched.dia && errors.dia && (
                                    <p className="text-xs mt-1" style={{ color: Colors.states.inactive }}>
                                        {errors.dia}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
                                    Mes
                                </label>
                                <select
                                    name="mes"
                                    value={formData.mes}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${touched.mes && errors.mes
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-[#CC0000]'
                                        }`}
                                    style={{
                                        borderColor: touched.mes && errors.mes
                                            ? Colors.states.inactive
                                            : Colors.table.lines,
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="">Seleccionar mes</option>
                                    {Object.entries(months).map(([numero, nombre]) => (
                                        <option key={numero} value={numero}>
                                            {nombre}
                                        </option>
                                    ))}
                                </select>
                                {touched.mes && errors.mes && (
                                    <p className="text-xs mt-1" style={{ color: Colors.states.inactive }}>
                                        {errors.mes}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
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
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-center ${touched.año && errors.año
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-[#CC0000]'
                                        }`}
                                    placeholder="AAAA"
                                    style={{
                                        borderColor: touched.año && errors.año
                                            ? Colors.states.inactive
                                            : Colors.table.lines,
                                        backgroundColor: 'white'
                                    }}
                                />
                                {touched.año && errors.año && (
                                    <p className="text-xs mt-1" style={{ color: Colors.states.inactive }}>
                                        {errors.año}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] my-6" style={{ outlineColor: Colors.table.lines }}></div>

                        {/* Técnico */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
                                Selecciona el técnico
                            </label>
                            <select
                                name="tecnico"
                                value={formData.tecnico}
                                onChange={handleTechnicianSelect}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${technicianError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#CC0000]'
                                    }`}
                                style={{
                                    borderColor: technicianError ? Colors.states.inactive : Colors.table.lines,
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="">Seleccionar técnico</option>
                                {technicians.map(tech => (
                                    <option key={tech.id} value={tech.id}>
                                        {tech.nombre} - {tech.titulo}
                                    </option>
                                ))}
                            </select>
                            {technicianError && (
                                <p className="text-xs mt-1" style={{ color: Colors.states.inactive }}>
                                    {technicianError}
                                </p>
                            )}
                        </div>

                        {/* Tabla de técnicos seleccionados (Componente separado) */}
                        <TechniciansTable
                            technicians={selectedTechnicians}
                            onRemoveTechnician={removeTechnician}
                        />

                        <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] my-6" style={{ outlineColor: Colors.table.lines }}></div>

                        {/* Nro. Orden */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
                                Nro. Orden
                            </label>
                            <select
                                name="orden"
                                value={formData.orden ? formData.orden.id : ""}
                                onChange={(e) => {
                                    const selectedOrder = orders.find(order => order.id === e.target.value) || null;
                                    handleInputChange({
                                        target: {
                                            name: "orden",
                                            value: selectedOrder
                                        }
                                    } as any);
                                }}
                                onBlur={handleBlur}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${touched.orden && errors.orden
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-[#CC0000]"
                                    }`}
                                style={{
                                    borderColor: touched.orden && errors.orden
                                        ? Colors.states.inactive
                                        : Colors.table.lines,
                                    backgroundColor: "white"
                                }}
                            >
                                <option value="">Seleccionar orden</option>
                                {orders.map(order => (
                                    <option key={order.id} value={order.id}>
                                        {order.id} - {order.cliente}
                                    </option>
                                ))}
                            </select>



                            {touched.orden && errors.orden && (
                                <p className="text-xs mt-1" style={{ color: Colors.states.inactive }}>
                                    {errors.orden}
                                </p>
                            )}
                        </div>

                        {/* Observaciones */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
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
                                style={{
                                    borderColor: Colors.table.lines,
                                    backgroundColor: 'white'
                                }}
                            />
                        </div>
                    </form>
                </div>

                {/* Botones fijos en la parte inferior */}
                < div className="p-4 border-t" style={{ borderColor: Colors.table.lines, backgroundColor: Colors.table.primary }}>
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
                            Guardar
                        </button>
                    </div>
                </div >

                <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px]" style={{ outlineColor: Colors.texts.primary }}></div>
            </div >
        </div >,
        document.body
    );
};