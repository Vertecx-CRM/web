// components/appointments/components/AppointmentDetailsModal/AppointmentDetailsModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import Colors from '@/shared/theme/colors';
import { AppointmentDetailsModalProps } from '../../types/typeAppointment';

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onView,
  onCancel
}) => {
  if (!isOpen || !appointment) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
      <div
        className="p-4 rounded-lg shadow-lg w-full max-w-md relative z-50 mx-auto max-h-[100vh] flex flex-col"
        style={{ backgroundColor: Colors.table.primary }}
      >
        {/* Header con número de orden y acciones */}
        <div className="flex justify-between items-center px-4 py-3 rounded-t-lg mb-4">
          <div className="flex items-center space-x-3">
            <div className="font-semibold text-2xl" style={{ color: Colors.texts.primary }}>
              {appointment.orden || 'Nro. Orden'}
            </div>
            <div className="flex space-x-2">
              {/* Botón Editar */}
              <button
                onClick={() => onEdit(appointment)}
                className="p-1 hover:opacity-70 transition-opacity"
                title="Editar cita"
              >
                <img src="/icons/edit.svg" alt="Editar" className="w-5 h-5" />
              </button>

              {/* Botón Ver */}
              <button
                onClick={() => onView(appointment)}
                className="p-1 hover:opacity-70 transition-opacity"
                title="Ver detalles"
              >
                <img src="/icons/Eye.svg" alt="Ver" className="w-5 h-5" />
              </button>

              {/* Botón Cancelar */}
              <button
                onClick={() => onCancel(appointment)}
                className="p-1 hover:opacity-70 transition-opacity"
                title="Cancelar cita"
              >
                <img src="/icons/minus-circle.svg" alt="Cancelar" className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            className="p-1 hover:opacity-70 transition-opacity"
            title="Cerrar"
          >
            <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px]" style={{ outlineColor: Colors.texts.primary }}></div>

        {/* Cuerpo del modal */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Información de la cita */}
          <div className="space-y-4">
            {/* Técnico y Fecha */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium" style={{ color: Colors.texts.primary }}>
                  {appointment.tecnicos?.[0]?.nombre || 'Técnico no asignado'} - {appointment.tecnicos?.[0]?.titulo || ''}
                </span>
                <span className="text-sm" style={{ color: Colors.texts.secondary }}>
                  {appointment.dia}/{appointment.mes}/{appointment.año}
                </span>
              </div>
              <div className="text-sm" style={{ color: Colors.texts.secondary }}>
                {appointment.horaInicio}:{appointment.minutoInicio} - {appointment.horaFin}:{appointment.minutoFin}
              </div>
            </div>

            <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px]" style={{ outlineColor: Colors.table.lines }}></div>

            {/* Observación */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
                Observación
              </label>
              <div
                className="w-full px-3 py-2 border rounded-md min-h-[80px] overflow-y-auto break-words"
                style={{
                  borderColor: Colors.table.lines,
                  backgroundColor: 'white',
                  color: Colors.texts.primary,
                  maxHeight: '120px'
                }}
              >
                {appointment.observaciones || 'No hay observaciones'}
              </div>
            </div>

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
        </div>

        <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px]" style={{ outlineColor: Colors.texts.primary }}></div>
      </div>
    </div>,
    document.body
  );
};
