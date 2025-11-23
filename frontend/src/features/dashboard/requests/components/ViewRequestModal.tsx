"use client";

import Modal from "@/features/dashboard/components/Modal";

type TipoServicio = "Mantenimiento" | "Instalacion";

export type RequestData = {
  tipos: ("Mantenimiento" | "Instalacion")[];
  tipo?: string;
  servicio: string;
  descripcion: string;
  direccion: string;
  cliente: string;
  fecha?: string | Date;
  estado?: string;
  codigo?: string;
  programada?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  data: RequestData & {
    codigo?: string;
    estado?: string;
    fecha?: string | Date;
    serviceId?: number;
    clientId?: number;
  };
};

export default function ViewRequestModal({ isOpen, onClose, title = "Detalles de la solicitud", data }: Props) {
  const fechaTxt =
    data.fecha instanceof Date
      ? data.fecha.toLocaleString()
      : data.fecha
      ? new Date(data.fecha).toLocaleString()
      : undefined;

  let programadaTxt = "—";
  if (data.programada) {
    const d = new Date(data.programada);
    programadaTxt = Number.isNaN(d.getTime()) ? String(data.programada) : d.toLocaleString("es-CO");
  }

  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
        >
          Cerrar
        </button>
      }
    >
      <div className="grid gap-4">
        <hr className="border-gray-300" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {data.codigo && (
            <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2">
              <div className="text-[11px] uppercase tracking-wide text-gray-500">Código</div>
              <div className="text-sm text-gray-800">{data.codigo}</div>
            </div>
          )}
          {data.estado && (
            <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2">
              <div className="text-[11px] uppercase tracking-wide text-gray-500">Estado</div>
              <div className="text-sm text-gray-800">{data.estado}</div>
            </div>
          )}
          {fechaTxt && (
            <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2">
              <div className="text-[11px] uppercase tracking-wide text-gray-500">Fecha</div>
              <div className="text-sm text-gray-800">{fechaTxt}</div>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-700 mb-1">Servicio</div>
            <div className="rounded-md border border-gray-200 bg-gray-50 h-10 px-3 flex items-center text-sm text-gray-800">
              {data.servicio || "—"} {data.serviceId ? `(#${data.serviceId})` : ""}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-700 mb-1">Cliente</div>
            <div className="rounded-md border border-gray-200 bg-gray-50 h-10 px-3 flex items-center text-sm text-gray-800">
              {data.cliente || "—"} {data.clientId ? `(#${data.clientId})` : ""}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-700 mb-1">Dirección</div>
            <div className="rounded-md border border-gray-200 bg-gray-50 h-10 px-3 flex items-center text-sm text-gray-800">
              {data.direccion || "—"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-700 mb-1">Programada</div>
            <div className="rounded-md border border-gray-200 bg-gray-50 h-10 px-3 flex items-center text-sm text-gray-800">
              {programadaTxt}
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-700 mb-1">Descripción</div>
          <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 min-h-12">
            {data.descripcion?.trim() || "—"}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-700 mb-1">Tipos</div>
          <div className="flex flex-wrap gap-2">
            {data.tipos?.length
              ? data.tipos.map((t) => (
                  <span key={t} className="inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs text-gray-800">
                    {t}
                  </span>
                ))
              : "—"}
          </div>
        </div>
      </div>
    </Modal>
  );
}
