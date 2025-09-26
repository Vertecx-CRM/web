import { AppointmentEvent, Order, TipoCita } from "../../types/typeAppointment";


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

  // Lógica de renderizado para eventos individuales
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

  let currentOrder: Order | null = null;
  if (typeof event.orden === "string") {
    currentOrder = orders.find((o) => o.id === event.orden) || null;
  } else {
    currentOrder = event.orden || null;
  }

  const tipoServicio = currentOrder?.tipoServicio || "Sin tipo de servicio";
  const nombreCliente = currentOrder?.cliente || "Cliente no asignado";

  // Función para determinar el color según el tipo de cita
  const getEventColor = (): string => {
    // Determinar color según el tipo de cita
    switch (event.tipoCita) {
      case "solicitud":
        return "#828299"; // Color para solicitud de cita
      case "ejecucion":
        return "#5b84ff"; // Color para ejecución de cita
      case "garantia":
        return "#ff6347"; // Color para garantía de cita
      default:
        return "#B20000"; // Color por defecto (rojo original)
    }
  };

  // Función para obtener el color del punto según el estado
  const getEstadoDotColor = (): string => {
    switch (event.estado) {
      case "Finalizado":
        return "#23ff2bff"; // Verde
      case "Pendiente":
        return "#e1b954ff"; // Naranja
      case "Cancelado":
        return "#ee0b0bff"; // Rojo oscuro
      default:
        return "#C47900"; // Naranja por defecto (Pendiente)
    }
  };

  // Función para obtener el texto del tipo de cita
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

  const bgColor = getEventColor();
  const dotColor = getEstadoDotColor();

  if (isShortEvent) {
    return (
      <div 
        className="event-content text-white rounded-md w-full h-full overflow-hidden p-1 flex flex-col justify-center text-[10px] sm:text-xs relative"
        style={{ backgroundColor: bgColor }}
      >
        {/* Punto indicador de estado con borde blanco */}
        <div 
          className="absolute top-1 right-1 w-2 h-2 rounded-full border border-white"
          style={{ backgroundColor: dotColor }}
        />
        <div className="text-center font-bold truncate">{getTipoCitaText()}</div>
        <div className="text-center">{startTime}</div>
      </div>
    );
  }

  return (
    <div
      className="event-content text-white rounded-md w-full h-full overflow-hidden p-2 flex flex-col relative"
      style={{ backgroundColor: bgColor }}
    >
      {/* Punto indicador de estado con borde blanco */}
      <div 
        className="absolute top-2 right-2 w-4 h-4 rounded-full border-[3px] border-white"
        style={{ backgroundColor: dotColor }}
      />

      {/* Mostrar el tipo de cita en lugar del tipo de servicio */}
      <div className="font-bold truncate text-center text-sm sm:text-base md:text-lg pr-4"> {/* pr-4 para evitar superposición con el punto */}
        {getTipoCitaText()}
      </div>
      
      {/* Mostrar tipo de servicio si existe orden */}
      {currentOrder && (
        <div className="truncate text-[10px] sm:text-xs text-center mt-1 opacity-90">
          {tipoServicio}
        </div>
      )}
      
      {/* Mostrar nombre del cliente en lugar de técnicos */}
      {currentOrder && (
        <div className="truncate text-[10px] sm:text-sm text-center mt-1">
          {nombreCliente}
        </div>
      )}
      
      {/* Mostrar información de tiempo para eventos más largos */}
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