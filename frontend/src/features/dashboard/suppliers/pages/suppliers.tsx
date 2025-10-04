"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import RequireAuth from "@/features/auth/requireauth";
import { useAuth } from "@/features/auth/authcontext";
import { DataTable } from "@/features/dashboard/components/datatable/DataTable";
import CreateSuppliersModal, { ProviderSubmitPayload } from "@/features/dashboard/suppliers/components/CreateSuppliersModal";
import { Column } from "../../components/datatable/types/column.types";
import EditSupplierModal from "../components/EditSupplierModal";

type Row = {
  id: number;
  name: string;
  nit: string;
  rating: number;
  contact: string;
  category: string;
  status: "Activo" | "Inactivo";
};

type RowWithContact = Row & { phone: string; email: string };

const MOCK_WITH_CONTACT: RowWithContact[] = [
  { id: 1, name: "TechAndes S.A.S.", nit: "900123456-7", rating: 4.6, contact: "María Fernanda Ríos", category: "Servidores", status: "Activo", phone: "+57 3001234567", email: "contacto@techandes.com" },
  { id: 2, name: "Redes Pacífico Ltda.", nit: "800987321-4", rating: 4.1, contact: "Juan Pablo Cabal", category: "Redes", status: "Activo", phone: "+57 3019876543", email: "info@redespacifico.com" },
  { id: 3, name: "SecureVision Colombia", nit: "901457880-2", rating: 3.8, contact: "Sofía Valencia", category: "Seguridad", status: "Inactivo", phone: "+57 3102223344", email: "ventas@securevision.com.co" },
  { id: 4, name: "Andina Software Group", nit: "900741258-3", rating: 4.7, contact: "Carlos Ariza", category: "Software", status: "Activo", phone: "+57 3145566778", email: "contacto@andinasw.com" },
  { id: 5, name: "Energía & Respaldo S.A.", nit: "890112233-5", rating: 3.2, contact: "Daniel Castaño", category: "Energía", status: "Inactivo", phone: "+57 3128899001", email: "info@energiarespaldo.com" },
  { id: 6, name: "CloudLatam Proveedores", nit: "901203040-1", rating: 4.4, contact: "Ana Lucía Torres", category: "Nube", status: "Activo", phone: "+57 3013344556", email: "cloud@latam.com" },
  { id: 7, name: "Cableado Estructurado del Caribe", nit: "800456789-0", rating: 3.9, contact: "Hernán Bustos", category: "Redes", status: "Activo", phone: "+57 3167788990", email: "soporte@cableadocaribe.com" },
  { id: 8, name: "Almacenamiento Nevado", nit: "901334455-6", rating: 4.3, contact: "Laura Ramírez", category: "Almacenamiento", status: "Activo", phone: "+57 3134455667", email: "ventas@almacenamientonevado.co" },
  { id: 9, name: "Impresiones del Norte", nit: "830556677-8", rating: 2.9, contact: "Camilo Pérez", category: "Periféricos", status: "Inactivo", phone: "+57 3029988776", email: "contacto@impresionesnorte.com" },
  { id: 10, name: "Conectividad Andina", nit: "900998877-1", rating: 4.0, contact: "Daniela Hoyos", category: "Redes", status: "Activo", phone: "+57 3112233445", email: "info@conectividadandina.com" },
];

const MOCK: Row[] = MOCK_WITH_CONTACT.map(({ phone, email, ...rest }) => rest);

function stars(r: number) {
  const n = Math.round(r);
  return "★".repeat(n).padEnd(5, "☆");
}

export default function SuppliersPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [rows, setRows] = useState<Row[]>(MOCK);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);

  const columns: Column<Row>[] = [
    { key: "id", header: "Id" },
    { key: "name", header: "Nombre", render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
    { key: "nit", header: "NIT" },
    { key: "rating", header: "Calificación", render: (r) => (<span><span className="mr-1">{stars(r.rating)}</span><span className="text-xs text-gray-500">({r.rating.toFixed(1)})</span></span>) },
    { key: "contact", header: "Contacto" },
    { key: "category", header: "Categoría" },
    { key: "status", header: "Estado", render: (r) => (<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "Activo" ? "text-green-600" : "text-red-600"}`}>{r.status}</span>) },
  ];

  const searchableKeys: (keyof Row)[] = ["name", "contact", "category", "nit", "status"];

  const onView = (row: Row) => router.push(`/dashboard/suppliers/${row.id}`);

  const onEdit = (row: Row) => {
    setSelected(row);
    setOpenEdit(true);
  };

  const onDelete = async (row: Row) => {
    const res = await Swal.fire({
      title: "¿Eliminar proveedor?",
      text: `Se eliminará "${row.name}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      reverseButtons: true,
      focusCancel: true,
    });
    if (res.isConfirmed) {
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      await Swal.fire({ icon: "success", title: "Eliminado", text: "El proveedor fue eliminado correctamente.", timer: 1600, showConfirmButton: false });
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

  const mapRowToProvider = (row: Row): ProviderSubmitPayload => {
    const ext = MOCK_WITH_CONTACT.find((m) => m.id === row.id);
    return {
      name: row.name,
      nit: row.nit,
      phone: ext?.phone ?? "",
      email: ext?.email ?? "",
      contactName: row.contact,
      status: row.status,
      categories: row.category ? row.category.split(",").map((s) => s.trim()).filter(Boolean) : [],
      rating: Math.round(row.rating),
      imageFile: null,
      imageUrl: null,
    };
  };

  const handleUpdateProvider = async (data: ProviderSubmitPayload) => {
    if (!selected) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === selected.id
          ? {
              ...r,
              name: data.name.trim(),
              nit: data.nit.trim(),
              rating: Number(data.rating) || 0,
              contact: (data.contactName ?? "").trim(),
              category: data.categories && data.categories.length ? data.categories.join(", ") : "—",
              status: data.status,
            }
          : r
      )
    );
    setOpenEdit(false);
    setSelected(null);
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
        <EditSupplierModal
          isOpen={openEdit}
          onClose={() => {
            setOpenEdit(false);
            setSelected(null);
          }}
          onSave={handleUpdateProvider}
          provider={selected ? mapRowToProvider(selected) : null}
          title="Editar Proveedor"
        />
      </main>
    </RequireAuth>
  );
}
