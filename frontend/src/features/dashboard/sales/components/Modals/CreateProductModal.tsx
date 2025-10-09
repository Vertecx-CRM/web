import React from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = React.useState({
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad: "",
    categoria: "",
    imagen: null as File | null,
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, imagen: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative z-50">
        <button onClick={onClose} className="absolute top-4 right-4">
          <img src="/icons/X.svg" alt="Cerrar" className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold mb-4">Crear Producto</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nombre"
            placeholder="Ingrese nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />

          <input
            type="text"
            name="descripcion"
            placeholder="Ingrese descripción"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="precio"
              placeholder="Ingrese Precio"
              value={formData.precio}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
            <input
              type="number"
              name="cantidad"
              placeholder="Ingrese Cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Seleccione categoría</option>
            <option value="Electrónica">Electrónica</option>
            <option value="Accesorios">Accesorios</option>
          </select>

          <input type="file" onChange={handleFileChange} />

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md"
              style={{ backgroundColor: Colors.buttons.quaternary, color: Colors.texts.quaternary }}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
