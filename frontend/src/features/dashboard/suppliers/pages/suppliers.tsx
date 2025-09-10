"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/features/auth/requireauth";
import { useAuth } from "@/features/auth/authcontext";
import { DataTable, Column } from "@/features/dashboard/components/DataTable";
import CreateSuppliersModal, { ProviderSubmitPayload } from "@/features/dashboard/suppliers/components/CreateSuppliersModal";

type Row = {
  id: number;
  name: string;
  nit: string;
  rating: number;
  contact: string;
  category: string;
  status: "Activo" | "Inactivo";
};

const MOCK: Row[] = [
  { id: 1,  name: "TechAndes S.A.S.", nit: "900123456-7", rating: 4.6, contact: "María Fernanda Ríos", category: "Servidores", status: "Activo" },
  { id: 2,  name: "Redes Pacífico Ltda.", nit: "800987321-4", rating: 4.1, contact: "Juan Pablo Cabal", category: "Redes", status: "Activo" },
  { id: 3,  name: "SecureVision Colombia", nit: "901457880-2", rating: 3.8, contact: "Sofía Valencia", category: "Seguridad", status: "Inactivo" },
  { id: 4,  name: "Andina Software Group", nit: "900741258-3", rating: 4.7, contact: "Carlos Ariza", category: "Software", status: "Activo" },
  { id: 5,  name: "Energía & Respaldo S.A.", nit: "890112233-5", rating: 3.2, contact: "Daniel Castaño", category: "Energía", status: "Inactivo" },
  { id: 6,  name: "CloudLatam Proveedores", nit: "901203040-1", rating: 4.4, contact: "Ana Lucía Torres", category: "Nube", status: "Activo" },
  { id: 7,  name: "Cableado Estructurado del Caribe", nit:"800456789-0", rating: 3.9, contact:"Hernán Bustos", category: "Redes", status: "Activo" },
  { id: 8,  name: "Almacenamiento Nevado", nit: "901334455-6", rating: 4.3, contact: "Laura Ramírez", category: "Almacenamiento", status: "Activo" },
  { id: 9,  name: "Impresiones del Norte", nit: "830556677-8", rating: 2.9, contact: "Camilo Pérez", category: "Periféricos", status: "Inactivo" },
  { id:10, name: "Conectividad Andina", nit: "900998877-1", rating: 4.0, contact: "Daniela Hoyos", category: "Redes", status: "Activo" }
];

function stars(r: number) {
  const n = Math.round(r);
  return "★".repeat(n).padEnd(5, "☆");
}

export default function SuppliersPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [rows, setRows] = useState<Row[]>(MOCK);
  const [openCreate, setOpenCreate] = useState(false);

  const columns: Column<Row>[] = [
    { key: "id", header: "Id" },
    { key: "name", header: "Nombre", render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
    { key: "nit", header: "NIT" },
    { key: "rating", header: "Calificación", render: (r) => (
      <span>
        <span className="mr-1">{stars(r.rating)}</span>
        <span className="text-xs text-gray-500">({r.rating.toFixed(1)})</span>
      </span>
    ) },
    { key: "contact", header: "Contacto" },
    { key: "category", header: "Categoría" },
    { key: "status", header: "Estado", render: (r) => (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "Activo" ? "text-green-600" : "text-red-600"}`}>
        {r.status}
      </span>
    ) }
  ];

  const searchableKeys: (keyof Row)[] = ["name", "contact", "category", "nit", "status"];

  const onView = (row: Row) => router.push(`/dashboard/suppliers/${row.id}`);
  const onEdit = (row: Row) => router.push(`/dashboard/suppliers/${row.id}/edit`);
  const onDelete = (row: Row) => {
    if (confirm(`¿Eliminar proveedor "${row.name}"?`)) {
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    }
  };

  const handleSaveProvider = async (data: ProviderSubmitPayload) => {
    setRows((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1;
      const newRow: Row = {
        id: nextId,
        name: data.name.trim(),
        nit: data.nit.trim(),
        rating: Number(data.rating) || 0,
        contact: (data.contactName ?? "").trim(),
        category: data.categories && data.categories.length ? data.categories.join(", ") : "—",
        status: data.status,
      };
      return [...prev, newRow];
    });
    setOpenCreate(false);
  };

  return (
    <RequireAuth>
      <main className="flex-1 flex flex-col bg-gray-100">
        <DataTable<Row>
          data={rows}
          columns={columns}
          pageSize={5}
          searchableKeys={searchableKeys}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreate={() => setOpenCreate(true)}
          createButtonText="Crear Proveedor"
        />
        <CreateSuppliersModal
          isOpen={openCreate}
          onClose={() => setOpenCreate(false)}
          onSave={handleSaveProvider}
        />
      </main>
    </RequireAuth>
  );
}
