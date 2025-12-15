import React, { useState } from "react";
import { CreateProductModal } from "../Modals/CreateProductModal";
import { CreateServiceModal } from "../Modals/CreateServiceModal";

export default function CrearVenta() {
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);

  const handleSaveProduct = (data: any) => {
    console.log("Producto guardado", data);
  };

  const handleSaveService = (data: any) => {
    console.log("Servicio guardado", data);
  };

  return (
    <div>
      {/* ... aquí va tu formulario de Crear Venta ... */}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsProductOpen(true)}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          + Agregar Producto
        </button>
        <button
          type="button"
          onClick={() => setIsServiceOpen(true)}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          + Agregar Servicio
        </button>
      </div>

      <CreateProductModal
        isOpen={isProductOpen}
        onClose={() => setIsProductOpen(false)}
        onSave={handleSaveProduct}
      />
      <CreateServiceModal
        isOpen={isServiceOpen}
        onClose={() => setIsServiceOpen(false)}
        onSave={handleSaveService}
      />
    </div>
  );
}
