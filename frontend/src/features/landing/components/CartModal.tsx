"use client";
import { X } from "lucide-react";
import Image from "next/image";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo oscuro */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenido del modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 z-50">
        {/* Cerrar */}
        <button
          className="absolute top-4 right-4 text-gray-700 hover:text-black"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-semibold mb-6">Tu carrito</h2>

        {/* Tabla productos */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="p-3">Producto</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Cantidad</th>
                <th className="p-3">Servicio</th>
                <th className="p-3">Sub-total</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Ejemplo de fila */}
              <tr className="border-b">
                <td className="p-3 flex items-center gap-3">
                  <Image
                    src="/assets/imgs/laptop.png"
                    alt="Producto"
                    width={60}
                    height={60}
                  />
                  Victus HP SIO
                </td>
                <td className="p-3">$2.000.000</td>
                <td className="p-3 flex items-center gap-2">
                  <button className="px-2 border rounded">-</button>
                  <span>1</span>
                  <button className="px-2 border rounded">+</button>
                </td>
                <td className="p-3">
                  <input type="checkbox" defaultChecked />
                </td>
                <td className="p-3">$2.000.000</td>
                <td className="p-3">
                  <button className="text-red-600 hover:text-red-800">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Datos del cliente */}
        <div className="mt-6 space-y-4">
          <p>
            <strong>Nombre:</strong> Samuel Córdoba
          </p>
          <p>
            <strong>Cédula:</strong> 1033259147
          </p>
          <textarea
            placeholder="Ingrese su dirección de envío"
            className="w-full border p-3 rounded-md"
          />
        </div>

        {/* Total y botón */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-2xl font-bold">Total: $6.000.000</p>
          <button className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-md text-lg font-semibold transition">
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
}
