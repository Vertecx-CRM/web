"use client";

import React from "react";
import {
  getTechnicianKnowledgeSummary,
  type TechnicianProfileOption,
} from "@/features/dashboard/requests/utils/technicianProfiles";

type Props = {
  technician: TechnicianProfileOption;
  heading: string;
  helperText?: string | null;
  availability: "available" | "busy" | "selected";
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const availabilityConfig = {
  available: {
    label: "Disponible",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  busy: {
    label: "Ocupado en ese horario",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  selected: {
    label: "Ya seleccionado",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
} as const;

export default function TechnicianProfilePreview({
  technician,
  heading,
  helperText,
  availability,
}: Props) {
  const availabilityUi = availabilityConfig[availability];

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {technician.image ? (
            <img
              src={technician.image}
              alt={technician.label}
              className="h-14 w-14 rounded-2xl border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700">
              {initials(technician.label) || "TC"}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {heading}
            </p>
            <h4 className="truncate text-sm font-semibold text-slate-900">
              {technician.label}
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              Tecnico #{technician.technicianid}
              {technician.title ? ` - ${technician.title}` : ""}
            </p>
            {helperText ? (
              <p className="mt-2 text-xs leading-5 text-slate-600">
                {helperText}
              </p>
            ) : null}
          </div>
        </div>

        <span
          className={[
            "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
            availabilityUi.className,
          ].join(" ")}
        >
          {availabilityUi.label}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/80 bg-white/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Habilidades
          </p>
          {technician.specialties.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {technician.specialties.map((specialty) => (
                <span
                  key={`${technician.technicianid}-${specialty.techniciantypeid}-${specialty.name}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                >
                  {specialty.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Este tecnico aun no tiene habilidades configuradas en tipos de
              tecnico.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-white/80 bg-white/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Conocimiento registrado
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            {getTechnicianKnowledgeSummary(technician)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {technician.email ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">
                {technician.email}
              </span>
            ) : null}
            {technician.phone ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">
                {technician.phone}
              </span>
            ) : null}
            {technician.cvUrl ? (
              <a
                href={technician.cvUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-300 bg-slate-900 px-2.5 py-1 font-medium text-white transition hover:bg-slate-800"
              >
                Ver CV
              </a>
            ) : (
              <span className="rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-slate-500">
                Sin CV visible
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

