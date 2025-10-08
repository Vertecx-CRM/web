"use client";

import { Star, Mail, Phone, BadgeCheck, BadgeX, Pencil, Power, X } from "lucide-react";
import Modal from "@/features/dashboard/components/Modal";

type Provider = {
  id?: string | number;
  name: string;
  nit: string;
  phone: string;
  email: string;
  categories: string[];
  rating: number;
  contactName: string;
  status: "Activo" | "Inactivo";
  imageUrl?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  onEdit?: (p: Provider) => void;
  onToggleStatus?: (p: Provider) => void | Promise<void>;
  title?: string;
};

function StatusBadge({ status }: { status: Provider["status"] }) {
  const active = status === "Activo";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border ${
        active ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
      }`}
    >
      {active ? <BadgeCheck size={14} /> : <BadgeX size={14} />}
      {status}
    </span>
  );
}

function Stars({ value = 0 }: { value?: number }) {
  const v = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => {
        const active = v >= n;
        return (
          <Star
            key={n}
            size={16}
            className={active ? "text-yellow-500" : "text-gray-300"}
            strokeWidth={1.5}
            fill={active ? "currentColor" : "none"}
          />
        );
      })}
      <span className="ml-1 text-xs text-gray-500">({v}/5)</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[13px] text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-800">{children}</div>
    </div>
  );
}

export default function ProviderDetailsModal({
  isOpen,
  onClose,
  provider,
  onEdit,
  onToggleStatus,
  title = "Detalles del Proveedor",
}: Props) {
  if (!provider) return null;

  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex w-full justify-end gap-2">
          {onToggleStatus && (
            <button
              type="button"
              onClick={() => onToggleStatus(provider)}
              className="inline-flex items-center gap-2 rounded-md border px-3 h-9 text-sm bg-gray-50 hover:bg-gray-100"
              title={provider.status === "Activo" ? "Desactivar" : "Activar"}
            >
              <Power size={16} />
              {provider.status === "Activo" ? "Desactivar" : "Activar"}
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(provider)}
              className="inline-flex items-center gap-2 rounded-md bg-black px-3 h-9 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              <Pencil size={16} />
              Editar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-md border px-3 h-9 text-sm bg-white hover:bg-gray-50"
          >
            <X size={16} />
            Cerrar
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-[140px,1fr] gap-4">
        <div className="flex md:block items-start gap-3">
          <div className="w-[110px] md:w-[140px]">
            <div className="aspect-square w-full overflow-hidden rounded-xl border bg-gray-50">
              {provider.imageUrl ? (
                <img src={provider.imageUrl} alt={provider.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">Sin imagen</div>
              )}
            </div>
          </div>
          <div className="flex md:block flex-col gap-2 mt-1 md:mt-3">
            <StatusBadge status={provider.status} />
            <Stars value={provider.rating} />
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
            <p className="text-sm text-gray-500">Contacto: {provider.contactName || "—"}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="NIT">
              <span className="font-mono">{provider.nit || "—"}</span>
            </Field>
            <Field label="Teléfono">
              {provider.phone ? (
                <a href={`tel:${provider.phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-1 hover:underline">
                  <Phone size={14} /> {provider.phone}
                </a>
              ) : (
                "—"
              )}
            </Field>
            <Field label="Correo electrónico">
              {provider.email ? (
                <a href={`mailto:${provider.email}`} className="inline-flex items-center gap-1 hover:underline">
                  <Mail size={14} /> {provider.email}
                </a>
              ) : (
                "—"
              )}
            </Field>
            <Field label="Calificación">
              <Stars value={provider.rating} />
            </Field>
          </div>

          <div>
            <div className="text-[13px] text-gray-500 mb-1">Categorías</div>
            {provider.categories?.length ? (
              <div className="flex flex-wrap gap-2">
                {provider.categories.map((c) => (
                  <span key={c} className="inline-flex items-center rounded-full border bg-gray-50 px-2.5 py-1 text-xs text-gray-700">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Sin categorías</div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
