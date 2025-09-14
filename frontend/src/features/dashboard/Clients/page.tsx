"use client";
import Colors from "@/shared/theme/colors";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataTable, Column } from "../../dashboard/components/DataTable";
import EditClientModal from "./components/EditClientsModal/EditClients";
import ViewClientModal from "./components/ViewClientsModal/ViewClients";
import CreateClientModal from "./components/CreateClientsModal/CreateClients";
import { useClients } from "../Clients/hooks/useClients";
import { Client, EditClientData } from "./types/typeClients";

export default function Clients() {
  const {
    clients,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingClient,
    viewingClient,
    handleCreateClient,
    handleEditClient,
    handleView,
    handleEdit,
    handleDelete,
    closeModals
  } = useClients();

  const columns: Column<Client>[] = [
    { key: "id", header: "Id" },
    { key: "tipo", header: "Tipo" },
    { key: "documento", header: "Documento" },
    { key: "nombre", header: "Nombre" },
    { key: "telefono", header: "Teléfono" },
    { key: "correoElectronico", header: "Correo electrónico" },
    { key: "rol", header: "Rol" },
    {
      key: "estado",
      header: "Estado",
      render: (row: Client) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: row.estado === "Activo" ? "#e8f5e8" : "#f5e8e8",
            color: row.estado === "Activo" ? Colors.states.success : Colors.states.inactive,
          }}
        >
          {row.estado}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen" >
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
   
      {/* Main Content */}

        {/* Content */}
        <main className="p-6">
          <div className=" rounded-lg shadow-sm">
            {/* Modales */}
            <CreateClientModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreateClient}
            />
            
            <EditClientModal
              isOpen={!!editingClient}
              client={editingClient}
              onClose={closeModals}
              onSave={(clientData: EditClientData) => {
                if (editingClient) {
                  handleEditClient(editingClient.id, clientData);
                }
              }}
            />
            
            <ViewClientModal
              isOpen={!!viewingClient}
              client={viewingClient}
              onClose={closeModals}
            />

            <DataTable<Client>
              data={clients}
              columns={columns}
              pageSize={10}
              searchableKeys={["id", "tipo", "documento", "nombre", "telefono", "correoElectronico", "rol", "estado"]}
              onCreate={() => setIsCreateModalOpen(true)}
              createButtonText="Crear Cliente"
              searchPlaceholder="Buscar clientes..."
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </main>
    </div>
  );
}