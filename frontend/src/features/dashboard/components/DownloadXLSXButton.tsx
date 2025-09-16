"use client";

import * as XLSX from "xlsx";
import { MouseEvent } from "react";
import Colors from "@/shared/theme/colors";

interface DownloadXLSXButtonProps<T extends Record<string, any>> {
  data: T[];
  fileName?: string;
  headers?: string[];
}

export default function DownloadXLSXButton<T extends Record<string, any>>({
  data,
  fileName = "reporte.xlsx",
  headers,
}: DownloadXLSXButtonProps<T>) {
  const downloadExcel = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!data || data.length === 0) return;

    const keys = Object.keys(data[0]) as (keyof T)[];
    const wsData = [
      headers || keys.map(String),
      ...data.map((row) => keys.map((k) => row[k] ?? "")),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, fileName);
  };

  return (
    <button
      onClick={downloadExcel}
      className="relative cursor-pointer inline-flex h-9 items-center gap-2 overflow-hidden rounded-md px-4 text-sm font-semibold text-white transition-transform duration-200 hover:scale-105 group"
      style={{ background: Colors.buttons.primary }}
    >
      <span className="absolute inset-0 bg-red-800 scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100"></span>

      <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
          />
        </svg>
        Descargar Excel
      </span>
    </button>
  );
}
