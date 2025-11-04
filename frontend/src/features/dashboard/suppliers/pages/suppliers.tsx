"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import RequireAuth from "@/features/auth/requireauth";
import { DataTable } from "@/features/dashboard/components/datatable/DataTable";
import { Column } from "@/features/dashboard/components/datatable/types/column.types";
import CreateSuppliersModal, {
  SupplierSubmitPayload,
} from "@/features/dashboard/suppliers/components/CreateSuppliersModal";
import EditSupplierModal from "@/features/dashboard/suppliers/components/EditSupplierModal";
import SupplierDetailsModal from "@/features/dashboard/suppliers/components/SupplierDetailsModal";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
} from "@/features/dashboard/suppliers/services/useSuppliers";
import type {
  SupplierDTO,
  CreateSupplierInput,
  UpdateSupplierInput,
} from "@/features/dashboard/suppliers/services/suppliers.service";
import { updateSupplier as updateSupplierSvc } from "@/features/dashboard/suppliers/services/suppliers.service";
import { useQueryClient } from "@tanstack/react-query";

type Row = {
  id: number;
  name: string;
  nit: string;
  rating: number;
  contact: string;
  status: "Activo" | "Inactivo";
  phone: string;
  email: string;
  address: string;
  imageUrl?: string | null;
};

export default function SuppliersPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useSuppliers();
  const createMut = useCreateSupplier();
  const updateMut = useUpdateSupplier(selected?.id ?? 0);

  const rows: Row[] = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return list.map((s: SupplierDTO) => ({
      id: s.supplierid,
      name: s.name,
      nit: s.nit,
      rating: s.rating ?? 0,
      contact: s.contactname,
      status: s.stateid === 1 ? "Activo" : "Inactivo",
      phone: s.phone,
      email: s.email,
      address: s.address ?? "",
      imageUrl: s.image || null,
    }));
  }, [data]);

  const columns: Column<Row>[] = [
    { key: "id", header: "Id" },
    {
      key: "name",
      header: "Nombre",
      render: (r) => (
        <span className="font-medium text-gray-900">{r.name}</span>
      ),
    },
    { key: "nit", header: "NIT" },
    { key: "phone", header: "Teléfono" },
    { key: "contact", header: "Contacto" },
    {
      key: "status",
      header: "Estado",
      render: (r) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            r.status === "Activo" ? "text-green-600" : "text-red-600"
          }`}
        >
          {r.status}
        </span>
      ),
    },
  ];

  const searchableKeys: (keyof Row)[] = [
    "name",
    "contact",
    "nit",
    "status",
    "phone",
    "email",
  ];

  const onView = (row: Row) => {
    setSelected(row);
    setOpenDetails(true);
  };

  const onEdit = (row: Row) => {
    setSelected(row);
    setOpenEdit(true);
  };

  const onDelete = async (row: Row) => {
    const res = await Swal.fire({
      title: "¿Inactivar proveedor?",
      text: `Se marcará "${row.name}" como Inactivo (no se eliminará).`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, inactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!res.isConfirmed) return;

    try {
      const dto: UpdateSupplierInput = { stateid: 2 };
      await updateSupplierSvc(row.id, dto);
      setOpenDetails(false);
      setSelected(null);
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      await Swal.fire({
        icon: "success",
        title: "Inactivado",
        text: "El proveedor fue marcado como Inactivo.",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (e: any) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: e?.message || "No se pudo inactivar",
      });
    }
  };

  const handleSaveSupplier = async (form: SupplierSubmitPayload) => {
    const dto: CreateSupplierInput = {
      name: form.name.trim(),
      nit: form.nit.trim(),
      phone: form.phone?.trim() || "",
      email: form.email?.trim() || "",
      address: form.address?.trim() || "",
      stateid: 1,
      contactname: form.contactName?.trim() || "",
      image: form.imageUrl?.trim() || "",
      rating: Number(form.rating) || 0,
    };
    await createMut.mutateAsync(dto);
    setOpenCreate(false);
    await Swal.fire({
      icon: "success",
      title: "Creado",
      text: "Proveedor creado correctamente.",
      timer: 1400,
      showConfirmButton: false,
    });
  };

  const handleUpdateSupplier = async (
    form: SupplierSubmitPayload & { statusid?: 1 | 2 }
  ) => {
    if (!selected) return;
    const stateid: 1 | 2 = form.statusid ?? (form.status === "Activo" ? 1 : 2);

    const dto: UpdateSupplierInput = {
      name: form.name?.trim(),
      nit: form.nit?.trim(),
      phone: form.phone?.trim() || "",
      email: form.email?.trim() || "",
      address: form.address?.trim() || "",
      stateid,
      contactname: form.contactName?.trim() || "",
      image: form.imageUrl?.trim() || selected.imageUrl || "",
      rating: Number(form.rating) || 0,
    };

    await updateMut.mutateAsync(dto);
    setOpenEdit(false);
    await Swal.fire({
      icon: "success",
      title: "Actualizado",
      text: "Proveedor actualizado correctamente.",
      timer: 1400,
      showConfirmButton: false,
    });
  };

  const mapRowToEditForm = (row: Row) =>
    ({
      name: row.name,
      nit: row.nit,
      phone: row.phone ?? "",
      email: row.email ?? "",
      address: row.address ?? "",
      contactName: row.contact ?? "",
      status: row.status,
      statusid: row.status === "Activo" ? 1 : 2,
      rating: Number(row.rating) || 0,
      imageFile: null,
      imageUrl: row.imageUrl ?? null,
    } as unknown as SupplierSubmitPayload & { statusid: 1 | 2 });

  const mapRowToDetails = (row: Row) => ({
    id: row.id,
    name: row.name,
    nit: row.nit,
    phone: row.phone ?? "",
    email: row.email ?? "",
    rating: Number(row.rating) || 0,
    contactName: row.contact ?? "",
    status: row.status,
    imageUrl: row.imageUrl ?? null,
    address: row.address ?? "",
    stateid: row.status === "Activo" ? 1 : 2,
  });

  if (isLoading) {
    return (
      <RequireAuth>
        <main className="flex-1 flex items-center justify-center bg-gray-100 p-8">
          Cargando proveedores…
        </main>
      </RequireAuth>
    );
  }

  if (error) {
    return (
      <RequireAuth>
        <main className="flex-1 flex items-center justify-center bg-gray-100 p-8">
          <div className="text-red-600">Error cargando proveedores</div>
        </main>
      </RequireAuth>
    );
  }

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
          onSave={handleSaveSupplier}
        />
        <EditSupplierModal
          key={selected?.id ?? "new"}
          isOpen={openEdit}
          onClose={() => setOpenEdit(false)}
          supplier={selected ? mapRowToEditForm(selected) : null}
          onSave={handleUpdateSupplier}
          title="Editar Proveedor"
        />

        <SupplierDetailsModal
          isOpen={openDetails}
          onClose={() => setOpenDetails(false)}
          supplier={selected ? mapRowToDetails(selected) : null}
          onEdit={() => {
            if (!selected) return;
            setOpenDetails(false);
            setOpenEdit(true);
          }}
          title="Detalles del Proveedor"
        />
      </main>
    </RequireAuth>
  );
}
