// components/events/CustomEventComponent.tsx

import { AppointmentEvent } from "../../types/typeAppointment";

// Define un tipo para el evento de grupo, que extiende al evento normal
interface GroupedEvent extends AppointmentEvent {
  isGrouped?: boolean;
  count?: number;
  groupedEvents?: AppointmentEvent[];
}

// La prop del componente ahora acepta el nuevo tipo
interface CustomEventProps {
  event: GroupedEvent;
}

export const CustomEventComponent = ({ event }: CustomEventProps) => {
  // Comprobación para eventos de grupo
  if (event.isGrouped && event.count) {
    return (
      <div className="event-group-card bg-[#1a1a1a] text-white rounded-md w-full h-full p-2 flex flex-col justify-center items-center cursor-pointer">
        <div className="text-xl font-bold">{event.count}</div>
        <div className="text-xs mt-1">citas</div>
      </div>
    );
  }

  // Lógica de renderizado para eventos individuales (tu código actual)
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
  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  const isShortEvent = durationMinutes <= 30;

  const technicians = event.tecnicos || [];
  const orderNumber = event.orden?.tipoServicio || "Sin tipo de servicio";

  if (isShortEvent) {
    return (
      <div className="event-content bg-[#B20000] text-white rounded-md w-full h-full overflow-hidden p-1 flex flex-col justify-center text-[10px] sm:text-xs">
        <div className="text-center font-bold truncate">{orderNumber}</div>
        <div className="text-center">{startTime}</div>
      </div>
    );
  }

  const bgColor = event.estado === "Cancelado" ? "#6c757d" : "#B20000";

  return (
    <div
      className="event-content text-white rounded-md w-full h-full overflow-hidden p-2 flex flex-col"
      style={{ backgroundColor: bgColor }}
    >
      <div className="font-bold truncate text-center text-sm sm:text-base md:text-lg">
        {orderNumber} {event.estado === "Cancelado" && "(Cancelada)"}
      </div>
      {technicians.length > 0 && (
        <div className="truncate text-[10px] sm:text-sm text-center mt-1">
          {technicians.length === 1
            ? technicians[0].nombre
            : `${technicians.length} técnicos`}
        </div>
      )}
      {event.estado === "Cancelado" && (
        <div className="mt-1 text-[10px] sm:text-xs text-center italic truncate">
          Motivo: {event.motivoCancelacion}
        </div>
      )}
    </div>
  );
};