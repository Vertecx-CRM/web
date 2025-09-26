import React from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Colors from '@/shared/theme/colors';
import { AppointmentEvent, Order } from '../../types/typeAppointment';


interface GroupedAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: AppointmentEvent[];
  onSelectAppointment: (appointment: AppointmentEvent) => void;
  onCreateAppointment?: () => void;
}

const estadoColores = {
  Finalizado: {
    backgroundColor: '#D2F5D3',
    textColor: '#168700',
  },
  Pendiente: {
    backgroundColor: '#E8D298',
    textColor: '#C47900',
  },
  Cancelado: {
    backgroundColor: '#F5D2D2',
    textColor: '#870000',
  },
};

export const GroupedAppointmentsModal: React.FC<GroupedAppointmentsModalProps> = ({
  isOpen,
  onClose,
  appointments,
  onSelectAppointment,
  onCreateAppointment,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
      <div
        className="p-4 rounded-lg shadow-lg w-full max-w-md relative z-50 mx-auto max-h-[100vh] flex flex-col"
        style={{ backgroundColor: Colors.table.primary }}
      >
        <div className="flex justify-between items-center px-4 py-3 rounded-t-lg mb-4">
          <div className="flex items-center gap-3">
            <div className="font-semibold text-xl" style={{ color: Colors.texts.primary }}>
              Citas Superpuestas ({appointments.length})
            </div>
            {onCreateAppointment && (
              <button
                onClick={onCreateAppointment}
                className="p-2 rounded-full transition-colors"
                style={{ backgroundColor: '#CC0000' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B20000')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#CC0000')}
                title="Crear nueva cita"
              >
                <Image src="/icons/Plus.svg" alt="Crear cita" width={20} height={20} className="h-5 w-5" style={{ filter: 'brightness(0) invert(1)' }} />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 hover:opacity-70 transition-opacity"
            title="Cerrar"
          >
            <Image src="/icons/X.svg" alt="Cerrar" width={20} height={20} className="h-5 w-5" />
          </button>
        </div>


        <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px]" style={{ outlineColor: Colors.texts.primary }}></div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {appointments.map((appointment) => {
            const estado = appointment.estado as keyof typeof estadoColores;
            const colores = estadoColores[estado];

            let tipoServicio = 'N/A';
            if (typeof appointment.orden === 'string') {
              const orderObj = orders.find((o) => o.id === appointment.orden);
              tipoServicio = orderObj?.tipoServicio || 'N/A';
            } else if (appointment.orden) {
              tipoServicio = appointment.orden.tipoServicio || 'N/A';
            }

            return (
              <div
                key={appointment.id}
                onClick={() => {
                  onSelectAppointment(appointment);
                  onClose();
                }}
                className="p-4 rounded-md shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
                style={{
                  backgroundColor: 'white',
                  borderColor: Colors.table.lines,
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg" style={{ color: Colors.texts.primary }}>
                    {tipoServicio}
                  </span>
                  <span className="text-sm" style={{ color: Colors.texts.secondary }}>
                    {new Date(appointment.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(appointment.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-sm" style={{ color: Colors.texts.secondary }}>
                  Técnicos: {appointment.tecnicos.map(t => t.nombre).join(', ') || 'N/A'}
                </div>
                <div
                  className="mt-2 p-1 text-xs text-center rounded-md"
                  style={{
                    backgroundColor: colores?.backgroundColor || 'transparent',
                    color: colores?.textColor || 'inherit',
                  }}
                >
                  {appointment.estado}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};