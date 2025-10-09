"use client";

import { useState } from "react";
import Colors from "@/shared/theme/colors";
import {
  validateQuoteField,
  validateQuoteForm,
  QuoteErrors,
} from "../validations/quotesValidations";
import { IQuote } from "../types/Quote.type";
import { showError } from "@/shared/utils/notifications";

interface Material {
  name: string;
  subtotal: number;
}

interface QuoteForm {
  serviceTypes: {
    mantenimiento: boolean;
    instalacion: boolean;
  };
  client: string;
  status: string;
  description: string;
  materials: Material[];
  total: number;
}

interface Props {
  onSave?: (data: QuoteForm) => void;
}

export default function RegisterQuoteForm({ onSave }: Props) {
  const [form, setForm] = useState<QuoteForm>({
    serviceTypes: { mantenimiento: false, instalacion: false },
    client: "",
    status: "",
    description: "",
    materials: [],
    total: 20000,
  });
  const [errors, setErrors] = useState<QuoteErrors>({});

  const handleFieldValidation = (
    field: keyof Omit<IQuote, "id">,
    value: any
  ) => {
    const error = validateQuoteField(field, value, []); // puedes pasar mockQuotes si lo deseas
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const [newMaterial, setNewMaterial] = useState("");
  const [subtotal, setSubtotal] = useState<number>(0);

  const clients = [
    "Pedro Pablo",
    "Juan David Usuga",
    "Estefanía Valle",
    "Danier Álvarez",
  ];
  const statuses = ["Pendiente", "Aprobada", "Rechazada", "Anulada"];

  /** ✅ Añadir material */
  const handleAddMaterial = () => {
    if (!newMaterial || subtotal <= 0) return;
    const material = { name: newMaterial, subtotal };
    const updatedMaterials = [...form.materials, material];
    const newTotal =
      form.total +
      updatedMaterials.reduce((acc, m) => acc + m.subtotal, 0) -
      form.materials.reduce((acc, m) => acc + m.subtotal, 0);

    setForm({ ...form, materials: updatedMaterials, total: newTotal });
    setNewMaterial("");
    setSubtotal(0);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateQuoteForm(form as any, []);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showError("Corrige los errores antes de guardar");
      return;
    }

    if (onSave) onSave(form);
  };

  return (
    <form
      onSubmit={handleSave}
      className="flex flex-col gap-5 p-5 text-sm text-gray-800"
    >
      {/* 🔹 Tipo de servicio */}
      <div>
        <label className="block text-base font-semibold mb-2">
          Tipo de servicio
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.serviceTypes.mantenimiento}
              onChange={(e) =>
                setForm({
                  ...form,
                  serviceTypes: {
                    ...form.serviceTypes,
                    mantenimiento: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 accent-gray-800"
            />
            Mantenimiento
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.serviceTypes.instalacion}
              onChange={(e) =>
                setForm({
                  ...form,
                  serviceTypes: {
                    ...form.serviceTypes,
                    instalacion: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 accent-gray-800"
            />
            Instalación
          </label>
        </div>
      </div>

      {/* 🔹 Cliente */}
      <div>
        <label className="block text-base font-semibold mb-1">Cliente</label>
        <select
          value={form.client}
          onChange={(e) => setForm({ ...form, client: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-600 focus:outline-none focus:ring-1 focus:ring-black"
        >
          <option value="">Selecciona el cliente</option>
          {clients.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Estado */}
      <div>
        <label className="block text-base font-semibold mb-1">Estado</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-600 focus:outline-none focus:ring-1 focus:ring-black"
        >
          <option value="">Selecciona el estado</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Descripción */}
      <div>
        <label className="block text-base font-semibold mb-1">
          Descripción
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Ingrese sus observaciones"
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-black"
        ></textarea>
      </div>

      {/* 🔹 Materiales */}
      <div className="p-3 border rounded-lg bg-gray-50 flex flex-col gap-3">
        <div className="flex justify-between text-sm font-semibold text-gray-700">
          <span>Camara hivision pro</span>
          <span>Subtotal +20,000</span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleAddMaterial}
            className="flex items-center justify-center gap-2 bg-gray-500 text-white rounded-md px-4 py-2 w-full sm:w-auto hover:bg-gray-600 transition-all"
          >
            Añadir más materiales +
          </button>

          <input
            type="number"
            value={subtotal || ""}
            onChange={(e) => setSubtotal(Number(e.target.value))}
            className="w-20 border border-gray-300 rounded-md text-center py-2 text-gray-700 focus:ring-1 focus:ring-black"
            placeholder="00"
          />
        </div>
      </div>

      {/* 🔹 Total general */}
      <div className="flex justify-between items-center text-sm mt-2">
        <span className="font-semibold">Total general</span>
        <span>{form.total.toLocaleString("es-CO")}</span>
      </div>

      {/* 🔹 Botones */}
      <div className="flex justify-end gap-3 mt-3">
        <button
          type="button"
          className="bg-gray-300 text-black rounded-lg px-5 py-2 hover:bg-gray-200 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          style={{ backgroundColor: Colors.buttons.primary }}
          className="rounded-lg px-5 py-2 text-white hover:opacity-90 transition-all"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
