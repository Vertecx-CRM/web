// rescheduleModal.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { ReprogramAppointmentModalProps } from "../../types/typeAppointment";
import { showError, showWarning } from "@/shared/utils/notifications";

export const ReprogramAppointmentModal: React.FC<ReprogramAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onReprogramSave,
}) => {
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !appointment) return null;

  const getLocalDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);

    if (!selectedDate) return;

    const tomorrowStr = getTomorrowDateString();
    const [ty, tm, td] = tomorrowStr.split("-").map(Number);
    const [sy, sm, sd] = selectedDate.split("-").map(Number);

    const tomorrowOnly = new Date(ty, tm - 1, td, 0, 0, 0);
    const selectedOnly = new Date(sy, sm - 1, sd, 0, 0, 0);

    if (selectedOnly.getTime() < tomorrowOnly.getTime()) {
      setError("No puedes reprogramar una cita para hoy o mañana.");
      showWarning("No puedes reprogramar una cita para hoy o mañana.");
    } else {
      setError(null);
    }
  };

  // ✅ Validación final antes de guardar
  const handleSave = () => {
    if (!date || !time) {
      showError("Debes seleccionar una fecha y una hora.");
      return;
    }

    if (error) {
      showError(error);
      return;
    }

    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);

    const start = new Date(year, month - 1, day, hour, minute);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const tomorrowStr = getTomorrowDateString();
    const [ty, tm, td] = tomorrowStr.split("-").map(Number);
    const tomorrowOnly = new Date(ty, tm - 1, td, 0, 0, 0);

    const startOnly = new Date(year, month - 1, day, 0, 0, 0);

    if (startOnly.getTime() < tomorrowOnly.getTime()) {
      showError("No se puede reprogramar para hoy o mañana.");
      return;
    }

    onReprogramSave(start, end);
    onClose(); 
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div
        className="p-4 rounded-lg shadow-lg w-full max-w-md bg-white"
        style={{ backgroundColor: Colors.table.primary }}
      >
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: Colors.texts.primary }}
        >
          Reprogramar cita cancelada
        </h2>

        <label className="block text-sm font-medium mb-2">Nueva fecha</label>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className={`w-full px-2 py-1 border rounded mb-2 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          min={getTomorrowDateString()} // ✅ Bloquea visualmente días pasados y mañana
        />
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

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
            disabled={!!error}
            className={`px-4 py-2 rounded text-white ${
              error
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};