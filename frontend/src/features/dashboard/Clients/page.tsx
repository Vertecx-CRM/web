"use client";

import React, { useState } from "react";
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
            data={clients}
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