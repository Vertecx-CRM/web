import React, { useState } from "react";
import { createPortal } from "react-dom";
import { CreateAppointmentModalProps, TipoCita } from "../../types/typeAppointment";
import { technicians, months, tiposCita, solicitudesOrden, ordenesServicio } from "../../mocks/mockAppointment";

import Colors from "@/shared/theme/colors";
import { useCreateAppointmentForm } from "../../hooks/useAppointment";
import { TechniciansTable } from "../techniciansTable";
import { SolicitudSearchCombobox, OrdenServicioSearchCombobox } from "../search/genericSearchCombobox";

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
    isOpen,
    onClose,
    onSave,
    selectedDateTime
}) => {
    const {
        formData,
        selectedTechnicians,
        selectedSolicitud,
        selectedOrdenServicio,
        errors,
        technicianError,
        touched,
        comprobantePago,
        resetComboboxTrigger,
        handleInputChange,
        handleComprobantePagoChange,
        handleTimeChange,
        handleTechnicianSelect,
        removeTechnician,
        handleSolicitudSelect,
        handleOrdenServicioSelect,
        handleBlur,
        handleSubmit,
        removeComprobantePago,
    } = useCreateAppointmentForm({
        isOpen,
        onClose,
        onSave,
        selectedDateTime
    });

    // Manejar cambio de tipo de cita
    const handleTipoCitaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        handleInputChange({
            target: {
                name: "tipoCita",
                value: value as TipoCita
            }
        } as any);
    };

    // Función para mostrar preview del comprobante
    const renderFilePreview = (file: File | null, tipo: 'comprobante') => {
        if (!file) return null;

        const isImage = (fileName: string) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
        const isPDF = (fileName: string) => /\.pdf$/i.test(fileName);

        if (isImage(file.name)) {
            return (
                <img
                    src={URL.createObjectURL(file)}
                    alt="Comprobante"
                    className="h-20 w-20 object-cover rounded"
                />
            );
        } else if (isPDF(file.name)) {
            return (
                <div className="h-20 w-20 bg-red-100 rounded flex items-center justify-center">
                    <span className="text-red-600 font-medium">PDF</span>
                </div>
            );
        }

        return (
            <div className="h-20 w-20 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-600 font-medium">Archivo</span>
            </div>
        );
    };

    // Renderizar contenido según el tipo de cita seleccionado
    const renderTipoCitaContent = () => {
        switch (formData.tipoCita) {
            case "solicitud":
                return (
                    <div className="space-y-4">
                        {/* Selector de Solicitud de Orden - CORREGIDO */}
                        <SolicitudSearchCombobox
                            solicitudes={solicitudesOrden}
                            selectedItem={selectedSolicitud}
                            onItemSelect={handleSolicitudSelect}
                            onBlur={() => handleBlur({ target: { name: "solicitud" } } as any)}
                            error={errors.nombreCliente}
                            touched={touched.nombreCliente}
                            label="Buscar Solicitud de Orden"
                            resetTrigger={resetComboboxTrigger}
                        />

                        {/* Información de costo - SIEMPRE VISIBLE */}
                        <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Costo de la cita: $100,000 COP
                                    </h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        {selectedSolicitud
                                            ? "Solicitud seleccionada. Puede subir el comprobante de pago si es necesario."
                                            : "Seleccione una solicitud existente o suba el comprobante de pago."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Comprobante de pago - SIEMPRE VISIBLE */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
                                Comprobante de Pago {!selectedSolicitud && "*"}
                            </label>

                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="comprobantePago" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                                            <span>Subir archivo</span>
                                            <input
                                                id="comprobantePago"
                                                name="comprobantePago"
                                                type="file"
                                                className="sr-only"
                                                onChange={handleComprobantePagoChange} 
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            />
                                        </label>
                                        <p className="pl-1">o arrastrar y soltar</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        PDF, JPG, PNG, DOC hasta 10MB
                                    </p>
                                </div>
                            </div>
                            
                            {comprobantePago && (
                                <div className="mt-2 flex items-center justify-between p-2 bg-green-50 rounded-md">
                                    <div className="flex items-center space-x-3">
                                        {renderFilePreview(comprobantePago, 'comprobante')}
                                        <span className="text-sm text-green-700 truncate">
                                            {comprobantePago.name}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeComprobantePago}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mostrar información de la solicitud seleccionada */}
                        {selectedSolicitud && (
                            <div className="p-4 rounded-md bg-gray-50 border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Información de la Solicitud Seleccionada:</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="font-medium">Cliente:</span> {selectedSolicitud.cliente}
                                    </div>
                                    <div>
                                        <span className="font-medium">Servicio:</span> {selectedSolicitud.servicio}
                                    </div>
                                    <div>
                                        <span className="font-medium">Dirección:</span> {selectedSolicitud.direccion}
                                    </div>
                                    <div>
                                        <span className="font-medium">Monto:</span> ${selectedSolicitud.monto.toLocaleString()} COP
                                    </div>
                                    {selectedSolicitud.descripcion && (
                                        <div className="col-span-2">
                                            <span className="font-medium">Descripción:</span> {selectedSolicitud.descripcion}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case "ejecucion":
            case "garantia":
                return (
                    <div className="space-y-4">
                        {/* Selector de Orden de Servicio - CORREGIDO */}
                        <OrdenServicioSearchCombobox
                            ordenesServicio={ordenesServicio}
                            selectedItem={selectedOrdenServicio}
                            onItemSelect={handleOrdenServicioSelect}
                            onBlur={() => handleBlur({ target: { name: "orden" } } as any)}
                            error={errors.orden}
                            touched={touched.orden}
                            label={`Buscar Orden de Servicio ${formData.tipoCita === "garantia" ? "(Garantía)" : "(Ejecución)"}`}
                            resetTrigger={resetComboboxTrigger}
                        />

                        {/* Información de la orden seleccionada */}
                        {selectedOrdenServicio && (
                            <div className="p-4 rounded-md bg-gray-50 border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Información de la Orden:</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="font-medium">Cliente:</span> {selectedOrdenServicio.cliente}
                                    </div>
                                    <div>
                                        <span className="font-medium">Servicio:</span> {selectedOrdenServicio.servicio}
                                    </div>
                                    <div>
                                        <span className="font-medium">Dirección:</span> {selectedOrdenServicio.direccion}
                                    </div>
                                    <div>
                                        <span className="font-medium">Monto:</span> ${selectedOrdenServicio.monto.toLocaleString()} COP
                                    </div>
                                    {selectedOrdenServicio.materiales.length > 0 && (
                                        <div className="col-span-2">
                                            <span className="font-medium">Materiales:</span>
                                            {selectedOrdenServicio.materiales.map(m => `${m.nombre} (${m.cantidad})`).join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
            <div
                className="p-4 rounded-lg shadow-lg w-full max-w-4xl relative z-50 mx-auto max-h-[100vh] flex flex-col"
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
                    <form onSubmit={handleSubmit} className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Columna izquierda - Información principal */}
                            <div className="space-y-4">
                                {/* FECHA Y HORA PRIMERO */}
                                <div className="flex space-x-4">
                                    {/* Hora de inicio (izquierda) */}
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
                                            Hora de inicio *
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
                                            Hora final *
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
                                            Día *
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
                                            Mes *
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
                                            Año *
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

                                <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] my-4" style={{ outlineColor: Colors.table.lines }}></div>

                                {/* TIPO DE CITA ABAJO */}
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
                                        Tipo de Cita *
                                    </label>
                                    <select
                                        name="tipoCita"
                                        value={formData.tipoCita}
                                        onChange={handleTipoCitaChange}
                                        onBlur={handleBlur}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${touched.tipoCita && errors.tipoCita
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-[#CC0000]'
                                            }`}
                                        style={{
                                            borderColor: touched.tipoCita && errors.tipoCita
                                                ? Colors.states.inactive
                                                : Colors.table.lines,
                                            backgroundColor: 'white'
                                        }}
                                    >
                                        <option value="">Seleccionar tipo de cita</option>
                                        {tiposCita.map((tipo) => (
                                            <option key={tipo.value} value={tipo.value}>
                                                {tipo.label}
                                            </option>
                                        ))}
                                    </select>
                                    {touched.tipoCita && errors.tipoCita && (
                                        <p className="text-xs mt-1" style={{ color: Colors.states.inactive }}>
                                            {errors.tipoCita}
                                        </p>
                                    )}
                                </div>

                                {/* Contenido dinámico según tipo de cita */}
                                {formData.tipoCita && renderTipoCitaContent()}
                            </div>
                            {/* Columna derecha - Técnico y Observación */}
                            <div className="space-y-4">
                                {/* Técnico */}
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
                                        Selecciona el técnico *
                                    </label>
                                    <select
                                        name="tecnico"
                                        value=""
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

                                {/* Tabla de técnicos seleccionados */}
                                <TechniciansTable
                                    technicians={selectedTechnicians}
                                    onRemoveTechnician={removeTechnician}
                                />

                                <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] my-4" style={{ outlineColor: Colors.table.lines }}></div>

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
                                        rows={5}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                                        style={{
                                            borderColor: Colors.table.lines,
                                            backgroundColor: 'white'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Botones fijos en la parte inferior */}
                <div className="p-4 border-t" style={{ borderColor: Colors.table.lines, backgroundColor: Colors.table.primary }}>
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
                </div>

                <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px]" style={{ outlineColor: Colors.texts.primary }}></div>
            </div>
        </div>,
        document.body
    );
};