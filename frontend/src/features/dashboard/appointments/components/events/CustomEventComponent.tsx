// components/events/CustomEventComponent.tsx
import { AppointmentEvent } from "../../types/typeAppointment";

interface CustomEventProps {
  event: AppointmentEvent;
}

export const CustomEventComponent = ({ event }: CustomEventProps) => {
  // Normalizar siempre a Date
  const start = event.start instanceof Date ? event.start : new Date(event.start);
  const end = event.end instanceof Date ? event.end : new Date(event.end);

  const startTime = `${start.getHours().toString().padStart(2, "0")}:${start
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  const endTime = `${end.getHours().toString().padStart(2, "0")}:${end
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  // Calcular duración en minutos
  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  const isShortEvent = durationMinutes <= 30;

  const technicians = event.tecnicos || [];
  const orderNumber = event.orden || "Sin orden";

  if (isShortEvent) {
    // Versión minimalista para eventos cortos
    return (
      <div className="event-content bg-[#B20000] text-white rounded-md w-full h-full overflow-hidden p-1 flex flex-col justify-center text-[10px] sm:text-xs">
        <div className="text-center font-bold truncate">{orderNumber}</div>
        <div className="text-center">{startTime}</div>
      </div>
    );
  }

  const bgColor = event.estado === "Cancelado" ? "#6c757d" : "#B20000"; // gris si cancelada

  return (
    <div
      className="event-content text-white rounded-md w-full h-full overflow-hidden p-2 flex flex-col"
      style={{ backgroundColor: bgColor }}
    >

      {/* Número de orden */}
      <div className="font-bold truncate text-center text-sm sm:text-base md:text-lg">
        {orderNumber} {event.estado === "Cancelado" && "(Cancelada)"}
      </div>

      {/* Técnicos */}
      {technicians.length > 0 && (
        <div className="truncate text-[10px] sm:text-sm text-center mt-1">
          {technicians.length === 1
            ? technicians[0].nombre
            : `${technicians.length} técnicos`}
        </div>
      )}

      {/* Si está cancelada → solo motivo */}
      {event.estado === "Cancelado" && (
        <div className="mt-1 text-[10px] sm:text-xs text-center italic truncate">
          Motivo: {event.motivoCancelacion}
        </div>
      )}
    </div>
  );
};
