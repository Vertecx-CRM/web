"use client";

import { MouseEvent } from "react";
import Colors from "@/shared/theme/colors";
import ExcelJS from "exceljs";

interface DownloadXLSXButtonProps<T extends Record<string, unknown>> {
  data: T[];
  fileName?: string;
  headers?: string[]; // nombres visibles en español
  excludeKeys?: (keyof T)[]; // claves que no deben mostrarse
}

export default function DownloadXLSXButton<T extends Record<string, unknown>>({
  data,
  fileName = "reporte.xlsx",
  headers,
  excludeKeys = ["image"] as (keyof T)[], // por defecto quitamos imagen
}: DownloadXLSXButtonProps<T>) {
  const downloadExcel = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!data || data.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reporte");

    // Obtenemos solo las keys que no están en excludeKeys
    const keys = (Object.keys(data[0]) as (keyof T)[]).filter(
      (k) => !excludeKeys.includes(k)
    );

    // Si hay headers, los usamos; si no, usamos las keys filtradas
    const headerRow = headers ?? keys.map(String);
    worksheet.addRow(headerRow);

    const headerCell = worksheet.getRow(1);
    headerCell.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFDC2626" },
      };
      cell.font = {
        color: { argb: "FFFFFFFF" },
        bold: true,
      };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FF000000" } },
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
    });

    data.forEach((row, index) => {
      const rowData = keys.map((k) => {
        if (k === "price") {
          return `$${(row[k] as number).toLocaleString("es-CO")}`;
        }
        return row[k] ?? "";
      });

      const newRow = worksheet.addRow(rowData);

      if (index % 2 !== 0) {
        newRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF3F4F6" },
          };
        });
      }

      newRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFC0C0C0" } },
          bottom: { style: "thin", color: { argb: "FFC0C0C0" } },
          left: { style: "thin", color: { argb: "FFC0C0C0" } },
          right: { style: "thin", color: { argb: "FFC0C0C0" } },
        };
      });
    });

    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
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
