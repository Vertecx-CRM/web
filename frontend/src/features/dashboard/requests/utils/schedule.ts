function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function parseTime(raw?: string | null) {
  const match = String(raw ?? "").match(/^(\d{1,2}):(\d{2})$/);
  const hours = match ? Number(match[1]) : 9;
  const minutes = match ? Number(match[2]) : 0;
  return {
    hours: Number.isFinite(hours) ? hours : 9,
    minutes: Number.isFinite(minutes) ? minutes : 0,
  };
}

function parseDate(raw?: string | null) {
  const match = String(raw ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (![year, month, day].every(Number.isFinite)) return null;
  return { year, month, day };
}

export function splitDateTime(value?: string | Date | null) {
  if (!value) return { date: null, time: null };

  // Si es string con formato ISO, evitar el desplazamiento de zona horaria
  if (typeof value === "string") {
    const isoMatch = value.match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2}))/);
    if (isoMatch) {
      const datePart = isoMatch[1];
      const timePart = `${isoMatch[2]}:${isoMatch[3]}`;
      return { date: datePart, time: timePart };
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return { date: null, time: null };
  // Extraer en UTC para no mover la fecha por la zona horaria local
  return {
    date: `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`,
    time: `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}`,
  };
}

export function buildScheduledAt(dateStr?: string | null, timeStr?: string | null, fallback?: Date | null) {
  const parsedDate = parseDate(dateStr);
  if (parsedDate) {
    const time = parseTime(timeStr);
    const result = new Date(
      parsedDate.year,
      parsedDate.month - 1,
      parsedDate.day,
      time.hours,
      time.minutes,
      0,
      0
    );
    return result.toISOString();
  }

  if (fallback) {
    return fallback.toISOString();
  }

  return null;
}
