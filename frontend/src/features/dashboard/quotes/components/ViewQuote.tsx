"use client";

import { IQuote } from "../types/Quote.type";

interface ViewQuoteProps {
  quote: IQuote;
}

export default function ViewQuote({ quote }: ViewQuoteProps) {
  // ✅ Estructura segura y sin duplicaciones
  const safeQuote = {
    serviceTypes: quote?.serviceTypes ?? {
      mantenimiento: false,
      instalacion: false,
    },
    materials: quote?.materials ?? [],
    total: quote?.total ?? 0,
    description: quote?.description ?? "",
    client: quote?.client ?? "",
    status: quote?.status ?? "",
    creationDate: quote?.creationDate ?? "",
    amount: quote?.amount ?? 0,
  };

  // 🧾 Construir texto de tipos de servicio
  const serviceText = [
    safeQuote.serviceTypes.mantenimiento ? "Mantenimiento" : "",
    safeQuote.serviceTypes.instalacion ? "Instalación" : "",
  ]
    .filter(Boolean)
    .join(" e ");

  // 🧱 Materiales o lista vacía
  const materials =
    safeQuote.materials.length > 0
      ? safeQuote.materials
      : [{ name: "Camara hivision pro", subtotal: 20000 }];

  return (
    <div className="flex flex-col gap-4 text-sm text-gray-800 p-2 max-h-[85vh] overflow-y-auto scroll-smooth">
      {/* Tipo servicio */}
      <div>
        <label className="block text-sm font-medium mb-1">Tipo servicio</label>
        <input
          type="text"
          value={serviceText || "—"}
          disabled
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700"
        />
      </div>

      {/* Estado */}
      <div>
        <label className="block text-sm font-medium mb-1">Estado</label>
        <input
          type="text"
          value={safeQuote.status || "—"}
          disabled
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 capitalize"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={safeQuote.description }
          disabled
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 resize-none"
        ></textarea>
      </div>

      {/* Cliente */}
      <div>
        <label className="block text-sm font-medium mb-1">Cliente</label>
        <input
          type="text"
          value={safeQuote.client || "—"}
          disabled
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700"
        />
      </div>

      {/* Materiales */}
      <div>
        <label className="block text-sm font-medium mb-1">Materiales</label>
        <div className="w-full border border-gray-300 rounded-md p-3 bg-gray-50 flex flex-col gap-2">
          {materials.map((m, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b border-gray-200 last:border-b-0 pb-1"
            >
              <span className="text-gray-800">{m.name}</span>
              <span className="font-medium text-gray-700">
                {m.subtotal.toLocaleString("es-CO")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total general */}
      <div className="flex justify-between items-center mt-2 text-sm font-medium">
        <span>Total general</span>
        <span>{safeQuote.total.toLocaleString("es-CO")}</span>
      </div>

      {/* Botón cancelar */}
      <div className="flex justify-end mt-3">
        <button
          type="button"
          className="cursor-pointer bg-gray-300 text-black px-5 py-2 rounded-lg hover:bg-gray-200 transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
