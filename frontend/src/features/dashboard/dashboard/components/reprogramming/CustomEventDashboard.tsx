"use client";

import React from "react";
import Colors from "@/shared/theme/colors";

export interface DashboardEvent {
  title: string;
  start: Date;
  end: Date;
  estado?: string;
  tipoCita?: "solicitud" | "ejecucion" | "garantia";
  tipoServicio?: string;
  cliente?: string;
  subestado?: string;
  motivoCancelacion?: string;
  isGrouped?: boolean;
  count?: number;
  groupedEvents?: DashboardEvent[];
}

interface CustomEventProps {
  event: DashboardEvent;
}

export const CustomEventDashboard: React.FC<CustomEventProps> = ({ event }) => {
  if (event.isGrouped && event.count) {
    return (
      <div className="bg-[#1a1a1a] text-white rounded-md w-full h-full p-2 flex flex-col justify-center items-center cursor-pointer shadow-sm hover:scale-[1.02] transition-transform">
        <div className="text-xl font-bold">{event.count}</div>
        <div className="text-xs mt-1">citas</div>
      </div>
    );
  }

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

  const getEventColor = (): string => {
    switch (event.tipoCita) {
      case "solicitud":
        return "#828299";
      case "ejecucion":
        return "#5b84ff";
      case "garantia":
        return "#ff6347";
      default:
        return Colors.graphic.linePrimary || "#B20000";
    }
  };
  const bgColor = getEventColor();

  const estadoColors =
    Colors.states?.appointment?.[
      event.estado?.toLowerCase() as keyof typeof Colors.states.appointment
    ] || { text: "#fff" };

  const subestadoColors =
    event.subestado === "Reprogramada"
      ? Colors.states.appointment.reprogramada
      : null;

  const circleStyle = subestadoColors
    ? {
        background: `linear-gradient(90deg, ${estadoColors.text} 50%, ${subestadoColors.text} 50%)`,
      }
    : { backgroundColor: estadoColors.text };

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

  if (isShortEvent) {
    return (
      <div
        className="text-white rounded-md w-full h-full overflow-hidden p-1 flex flex-col justify-center text-[10px] sm:text-xs relative shadow-sm"
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

  return (
    <div
      className="text-white rounded-md w-full h-full overflow-hidden p-2 flex flex-col relative shadow-md"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="absolute top-2 right-2 w-4 h-4 rounded-full border-[3px] border-white"
        style={circleStyle}
      />
      <div className="font-bold truncate text-center text-sm sm:text-base md:text-lg pr-4">
        {getTipoCitaText()}
      </div>

      {event.tipoServicio && (
        <div className="truncate text-[10px] sm:text-xs text-center mt-1 opacity-90">
          {event.tipoServicio}
        </div>
      )}

      {event.cliente && (
        <div className="truncate text-[10px] sm:text-sm text-center mt-1">
          {event.cliente}
        </div>
      )}

      <div className="truncate text-[8px] sm:text-xs text-center mt-1 opacity-80">
        {startTime} - {endTime}
      </div>

      {event.estado === "Cancelado" && event.motivoCancelacion && (
        <div className="mt-1 text-[10px] sm:text-xs text-center italic truncate">
          Motivo: {event.motivoCancelacion}
        </div>
      )}
    </div>
  );
};
