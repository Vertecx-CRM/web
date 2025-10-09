import { AppointmentEvent, Order } from "../../types/typeAppointment";
import Colors from "@/shared/theme/colors";

// Define un tipo para el evento de grupo, que extiende al evento normal
interface GroupedEvent extends AppointmentEvent {
  isGrouped?: boolean;
  count?: number;
  groupedEvents?: AppointmentEvent[];
}

interface CustomEventProps {
  event: GroupedEvent;
}

export const CustomEventComponent = ({ event }: CustomEventProps) => {
  // Eventos agrupados
  if (event.isGrouped && event.count) {
    return (
      <div className="event-group-card bg-[#1a1a1a] text-white rounded-md w-full h-full p-2 flex flex-col justify-center items-center cursor-pointer">
        <div className="text-xl font-bold">{event.count}</div>
        <div className="text-xs mt-1">citas</div>
      </div>
    );
  }

  // Fechas
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

  // Datos de la orden
  const currentOrder: Order | null = event.orden || null;
  const tipoServicio = currentOrder?.tipoServicio || "Sin tipo de servicio";
  const nombreCliente = currentOrder?.cliente || "Cliente no asignado";

  // 🎨 Colores de estado y subestado desde Colors
  const estadoColors =
    Colors.states.appointment[
      event.estado?.toLowerCase() as keyof typeof Colors.states.appointment
    ] || { background: "#ccc", text: "#000" };

  const subestadoColors =
    event.subestado === "Reprogramada"
      ? Colors.states.appointment.reprogramada
      : null;

  // Si hay subestado, usar gradiente mitad-mitad
  const circleStyle = subestadoColors
    ? {
        background: `linear-gradient(90deg, ${estadoColors.text} 50%, ${subestadoColors.text} 50%)`,
      }
    : { backgroundColor: estadoColors.text };

  // Texto tipo de cita
  const getTipoCitaText = (): string => {
    switch (event.tipoCita) {
      case "solicitud":
        return "Solicitud";
      case "ejecucion":
        return "Ejecución";
      case "garantia":
        return "Garantía";
      default:
        return "Cita";
    }
  };

  // Colores por tipo de cita (mantengo esto separado)
  const getEventColor = (): string => {
    switch (event.tipoCita) {
      case "solicitud":
        return "#828299";
      case "ejecucion":
        return "#5b84ff";
      case "garantia":
        return "#ff6347";
      default:
        return Colors.calendar.primary;
    }
  };

  const bgColor = getEventColor();

  // 📌 Eventos cortos
  if (isShortEvent) {
    return (
      <div
        className="event-content text-white rounded-md w-full h-full overflow-hidden p-1 flex flex-col justify-center text-[10px] sm:text-xs relative"
        style={{ backgroundColor: bgColor }}
      >
        <div
          className="absolute top-1 right-1 w-2 h-2 rounded-full border border-white"
          style={circleStyle}
        />
        <div className="text-center font-bold truncate">{getTipoCitaText()}</div>
        <div className="text-center">{startTime}</div>
      </div>
    );
  }

  // 📌 Eventos largos
  return (
    <div
      className="event-content text-white rounded-md w-full h-full overflow-hidden p-2 flex flex-col relative"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="absolute top-2 right-2 w-4 h-4 rounded-full border-[3px] border-white"
        style={circleStyle}
      />
      <div className="font-bold truncate text-center text-sm sm:text-base md:text-lg pr-4">
        {getTipoCitaText()}
      </div>

      {currentOrder && (
        <div className="truncate text-[10px] sm:text-xs text-center mt-1 opacity-90">
          {tipoServicio}
        </div>
      )}

      {currentOrder && (
        <div className="truncate text-[10px] sm:text-sm text-center mt-1">
          {nombreCliente}
        </div>
      )}

      <div className="truncate text-[8px] sm:text-xs text-center mt-1 opacity-80">
        {startTime} - {endTime}
      </div>

      {event.estado === "Cancelado" && (
        <div className="mt-1 text-[10px] sm:text-xs text-center italic truncate">
          Motivo: {event.motivoCancelacion}
        </div>
      )}
    </div>
  );
};
