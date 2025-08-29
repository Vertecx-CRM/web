"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/features/auth/requireauth";
import { useAuth } from "@/features/auth/authcontext";
import { DataTable, Column } from "@/features/dashboard/components/DataTable";

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
  { id:10,  name: "Conectividad Andina", nit: "900998877-1", rating: 4.0, contact: "Daniela Hoyos", category: "Redes", status: "Activo" }
];

function stars(rating: number) {
  const n = Math.round(rating);
  return "★".repeat(n).padEnd(5, "☆");
}

export default function SuppliersPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [rows, setRows] = useState<Row[]>(MOCK);

  const columns: Column<Row>[] = [
    { key: "id", header: "Id" },
    { key: "name", header: "Nombre", render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
    { key: "nit", header: "NIT" },
    { key: "rating", header: "Calificación", render: (r) => <span><span className="mr-1">{stars(r.rating)}</span><span className="text-xs text-gray-500">({r.rating.toFixed(1)})</span></span> },
    { key: "contact", header: "Contacto" },
    { key: "category", header: "Categoría" },
    { key: "status", header: "Estado", render: (r) => (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "Activo" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
        {r.status}
      </span>
    ) }
  ];

  const searchableKeys: (keyof Row)[] = ["name", "contact", "category", "nit"];

  const onView = (row: Row) => router.push(`/dashboard/suppliers/${row.id}`);
  const onEdit = (row: Row) => router.push(`/dashboard/suppliers/${row.id}/edit`);
  const onDelete = (row: Row) => {
    if (confirm(`¿Eliminar proveedor "${row.name}"?`)) {
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    }
  };

  function handleLogout() {
    logout();
    router.replace("/auth/login");
  }

  return (
    <RequireAuth>
      <main className="flex-1 flex flex-col bg-gray-100">
        <div className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div />
            <button
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              onClick={() => router.push("/dashboard/suppliers/new")}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
                <path strokeWidth="2" d="M12 5v14M5 12h14" />
              </svg>
              Crear Proveedor
            </button>
          </div>
        </div>

        <div className="px-6 pb-6">
          <DataTable<Row>
            data={rows}
            columns={columns}
            pageSize={5}
            searchableKeys={searchableKeys}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </main>
    </RequireAuth>
  );
}
