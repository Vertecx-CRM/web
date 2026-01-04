// components/CalendarToolbar.tsx
import type { View } from "react-big-calendar";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

export const CalendarToolbar = ({
  label,
  onNavigate,
  onView,
  view,
  views,
}: {
  label: string;
  onNavigate: (action: "TODAY" | "PREV" | "NEXT" | "DATE") => void;
  onView: (view: View) => void;
  view: View;
  views?: View[];
}) => {
  const viewLabels: Record<string, string> = {
    month: "Mes",
    week: "Semana",
    day: "Día",
    agenda: "Agenda",
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate("PREV")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate("TODAY")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
        >
          <CalendarDays className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate("NEXT")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="order-first shrink text-lg font-semibold text-slate-900 md:order-none">
        {label}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(views || []).map((viewName) => (
          <button
            key={viewName}
            type="button"
            onClick={() => onView(viewName)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
              viewName === view
                ? "border-black bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {viewLabels[viewName] ?? viewName}
          </button>
        ))}
      </div>
    </div>
  );
};
