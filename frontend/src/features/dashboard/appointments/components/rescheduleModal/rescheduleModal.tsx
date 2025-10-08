import React, { useState } from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { AppointmentEvent, ReprogramAppointmentModalProps } from "../../types/typeAppointment";


export const ReprogramAppointmentModal: React.FC<ReprogramAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onReprogramSave,
}) => {
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");

  if (!isOpen || !appointment) return null;

  const handleSave = () => {
    if (!date || !time) return;

    const [hour, minute] = time.split(":").map(Number);
    const start = new Date(date);
    start.setHours(hour, minute);

    const end = new Date(start.getTime() + 60 * 60 * 1000);

    onReprogramSave(start, end);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div
        className="p-4 rounded-lg shadow-lg w-full max-w-md bg-white"
        style={{ backgroundColor: Colors.table.primary }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: Colors.texts.primary }}>
          Reprogramar cita cancelada
        </h2>

        <label className="block text-sm font-medium mb-2">Nueva fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-2 py-1 border rounded mb-4"
        />

        <label className="block text-sm font-medium mb-2">Nueva hora</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full px-2 py-1 border rounded mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
