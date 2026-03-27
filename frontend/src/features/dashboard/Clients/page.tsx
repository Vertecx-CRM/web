"use client";

import React, { useState, useMemo } from "react";
import Colors from "@/shared/theme/colors";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { DataTable } from "../components/datatable/DataTable";
import EditClientModal from "./components/EditClientsModal/EditClients";
import ViewClientModal from "./components/ViewClientsModal/ViewClients";
import CreateClientModal from "./components/CreateClientsModal/CreateClients";

import { useClients } from "./hooks/useClients";
import { Client, EditClientData } from "./types/typeClients";
import { Column } from "@/features/dashboard/components/datatable/types/column.types";

export default function ClientsPage() {
  const {
    clients,
    loading,
    handleCreateClient,
    handleEditClient,
    handleDeleteClient,
  } = useClients();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setEditingClient(null);
    setViewingClient(null);
  };

  // ── Ordenamiento ────────────────────────────────────────────────────────
  type SortField = "nombre" | "documento";
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedClients = useMemo(() => {
    if (!sortField) return clients;
    return [...clients].sort((a, b) => {
      const aVal = String(a[sortField] ?? "").toLowerCase();
      const bVal = String(b[sortField] ?? "").toLowerCase();
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [clients, sortField, sortDir]);

  // ── Exportar clientes a Excel ──────────────────────────────────────────────
  const exportToExcel = async () => {
    const rows = clients.map((c) => ({
      "ID": c.id,
      "Nombre completo": `${c.nombre} ${c.apellido}`.trim(),
      "Tipo Documento": c.tipo,
      "Documento": c.documento,
      "Teléfono": c.telefono,
      "Correo": c.correoElectronico,
      "Ciudad": c.ciudad,
      "Código Postal": c.codigoPostal,
      "Estado": c.estado,
    }));
    const mod = await import("exceljs");
    const ExcelJS: any = (mod as any).default ?? mod;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Clientes");

    worksheet.columns = [
      { header: "ID", key: "ID", width: 10 },
      { header: "Nombre completo", key: "Nombre completo", width: 28 },
      { header: "Tipo Documento", key: "Tipo Documento", width: 18 },
      { header: "Documento", key: "Documento", width: 18 },
      { header: "TelÃ©fono", key: "TelÃ©fono", width: 18 },
      { header: "Correo", key: "Correo", width: 28 },
      { header: "Ciudad", key: "Ciudad", width: 18 },
      { header: "CÃ³digo Postal", key: "CÃ³digo Postal", width: 16 },
      { header: "Estado", key: "Estado", width: 14 },
    ];

    rows.forEach((row) => worksheet.addRow(row));

    worksheet.getRow(1).eachCell((cell: any) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFB91C1C" },
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clientes_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const columns: Column<Client>[] = [
    { key: "id", header: "Id" },
    { key: "tipo", header: "Tipo" },
    { key: "documento", header: "Documento" },
    {
      key: "nombre",
      header: "Nombre completo",
      render: (row: Client) =>
        `${row.nombre}${row.apellido ? " " + row.apellido : ""}`,
    },
    { key: "telefono", header: "Teléfono" },
    { key: "correoElectronico", header: "Correo electrónico" },
    { key: "ciudad", header: "Ciudad" },
    { key: "codigoPostal", header: "Código Postal" },
    {
      key: "estado",
      header: "Estado",
      render: (row: Client) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor:
              row.estado === "Activo" ? "#e8f5e8" : "#f5e8e8",
            color:
              row.estado === "Activo"
                ? Colors.states.success
                : Colors.states.inactive,
          }}
        >
          {row.estado}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="light"
      />

      <main className="p-6">
        <div className="rounded-lg shadow-sm">

          {/* CREATE MODAL */}
          <CreateClientModal
            isOpen={isCreateModalOpen}
            onClose={closeModals}
            onSave={handleCreateClient}
          />

          {/* EDIT MODAL */}
          <EditClientModal
            isOpen={!!editingClient}
            client={editingClient}
            onClose={closeModals}
            onSave={async (clientData: EditClientData) => {
              await handleEditClient(clientData);
              closeModals();
            }}
          />

          {/* VIEW MODAL */}
          <ViewClientModal
            isOpen={!!viewingClient}
            client={viewingClient}
            onClose={closeModals}
          />

          <DataTable<Client>
            module="customers"
            data={sortedClients}
            columns={columns}
            pageSize={10}
            searchableKeys={[
              "nombre",
              "apellido",
              "documento",
              "correoElectronico",
              "telefono",
              "estado",
              "ciudad",
              "codigoPostal",
            ]}
            rightActions={
              <div className="flex items-center gap-2">
                {/* Botones de orden */}
                {(["nombre", "documento"] as const).map((field) => (
                  <button
                    key={field}
                    onClick={() => handleSort(field)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors ${sortField === field
                        ? "bg-red-600 text-white border-red-600"
                        : "text-gray-600 bg-white hover:bg-gray-50 border-gray-300"
                      }`}
                    title={`Ordenar por ${field === "nombre" ? "Nombre" : "Documento"}`}
                  >
                    {field === "nombre" ? "Nombre" : "Documento"}
                    <span className="text-xs">
                      {sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕"}
                    </span>
                  </button>
                ))}
                {/* Excel */}
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 rounded-lg transition-colors"
                  title="Exportar a Excel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Excel
                </button>
              </div>
            }
            onCreate={() => setIsCreateModalOpen(true)}
            createButtonText="Crear Cliente"
            searchPlaceholder="Buscar clientes..."
            onView={(client) => setViewingClient(client)}
            onEdit={(client) => setEditingClient(client)}
            onDelete={(client) => handleDeleteClient(client.id)}
          />
        </div>
      </main>
    </div>
  );
}
