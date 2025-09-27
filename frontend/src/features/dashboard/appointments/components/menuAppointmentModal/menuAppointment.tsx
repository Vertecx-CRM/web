import React from 'react';
import { createPortal } from 'react-dom';
import Colors from '@/shared/theme/colors';
import { AppointmentDetailsModalProps, Order } from '../../types/typeAppointment';
import { showWarning } from '@/shared/utils/notifications';
import 'react-toastify/dist/ReactToastify.css';


export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onView,
  onCancel,
}) => {
  if (!isOpen || !appointment) return null;

  const handleEditClick = () => {
    if (appointment.estado === 'Finalizado') {
      showWarning('No se puede editar una cita finalizada.');
    } else {
      onEdit(appointment);
    }
  };

  let currentOrder: Order | null = null;
  currentOrder = appointment.orden || null;

  const clientName = currentOrder?.cliente || "Sin cliente";
  const tipoServicio = currentOrder?.tipoServicio || "Sin servicio";
  const tipoMantenimiento = currentOrder?.tipoMantenimiento || "";

  const titleText = currentOrder
    ? `${clientName} (${tipoServicio === "mantenimiento"
        ? `Mantenimiento - ${tipoMantenimiento}`
        : "Instalación"
      })`
    : "Sin orden asignada";

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
      <div
        className="p-4 rounded-lg shadow-lg w-full max-w-2xl relative z-50 mx-auto max-h-[150vh] flex flex-col"
        style={{ backgroundColor: Colors.table.primary }}
      >
        <div className="flex justify-between items-center px-4 py-3 rounded-t-lg mb-4">
          <div className="flex items-center space-x-3">
            <div className="font-semibold text-2xl" style={{ color: Colors.texts.primary }}>
              {titleText}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleEditClick}
                className="p-1 hover:opacity-70 transition-opacity"
                title="Editar cita"
              >
                <img src="/icons/edit.svg" alt="Editar" className="w-7 h-7" />
              </button>
              <button
                onClick={() => onView(appointment)}
                className="p-1 hover:opacity-70 transition-opacity"
                title="Ver detalles"
              >
                <img src="/icons/Eye.svg" alt="Ver" className="w-7 h-7" />
              </button>
              <button
                onClick={() => onCancel(appointment)}
                className="p-1 hover:opacity-70 transition-opacity"
                title="Cancelar cita"
              >
                <img src="/icons/minus-circle.svg" alt="Cancelar" className="w-7 h-7" />
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:opacity-70 transition-opacity"
            title="Cerrar"
          >
            <img src="/icons/X.svg" alt="Cerrar" className="w-7 h-7" />
          </button>
        </div>
        <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px]" style={{ outlineColor: Colors.texts.primary }}></div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
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
                {appointment.estado || "Sin estado"}
              </div>
              {appointment.estado === "Cancelado" && (
                <div className="mt-2 space-y-2">
                  {appointment.motivoCancelacion && (
                    <div
                      className="px-3 py-2 border rounded-md text-sm italic"
                      style={{ borderColor: Colors.table.lines }}
                    >
                      Motivo: {appointment.motivoCancelacion}
                    </div>
                  )}
                  {appointment.horaCancelacion && (
                    <div
                      className="px-3 py-2 border rounded-md text-sm"
                      style={{ borderColor: Colors.table.lines }}
                    >
                      Hora cancelación:{" "}
                      {new Date(appointment.horaCancelacion).toLocaleTimeString(
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