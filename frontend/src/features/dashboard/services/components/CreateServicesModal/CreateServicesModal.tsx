"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { Service } from "../../types/typesServices";

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Service, "id" | "state">) => void;
}

const categories = ["Mantenimiento Correctivo", "Mantenimiento Preventivo", "Instalación"];

const CreateServiceModal: React.FC<CreateServiceModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCircleClick = () => fileInputRef.current?.click();

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setImageFile(null);
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !imageFile) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    onSave({
      name,
      description,
      category,
      image: URL.createObjectURL(imageFile),
    });

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
      <div className="bg-white p-3 rounded-lg shadow-lg w-full max-w-2xl relative z-50 mx-auto">
        <button onClick={onClose} className="absolute top-2 right-2 z-10">
          <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
        </button>

        <div className="text-black font-semibold text-2xl text-center mb-3">
          Crear Servicio
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 p-1">
          {/* Imagen */}
          <div className="col-span-2 flex flex-col items-center mb-3">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            <div
              className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer mb-1"
              onClick={handleCircleClick}
              style={{ borderColor: Colors.table.lines }}
            >
              {imageFile ? (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Servicio"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                Haga clic en el círculo para {imageFile ? "cambiar" : "seleccionar"} la imagen
              </div>

              {imageFile && (
                <div className="flex flex-col items-center space-y-1">
                  <div className="text-xs text-green-600 font-medium">
                    {imageFile.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="text-red-500 text-xs hover:text-red-700 px-2 py-1 border border-red-200 rounded-md"
                    style={{ borderColor: Colors.states.nullable }}
                  >
                    Eliminar imagen
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Nombre
            </label>
            <input
              type="text"
              placeholder="Ingrese nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            >
              <option value="">Seleccione categoría</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Descripción
            </label>
            <textarea
              placeholder="Ingrese descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>

          {/* Botones */}
          <div className="col-span-2 flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors text-sm"
              style={{ backgroundColor: Colors.buttons.tertiary, color: Colors.texts.quaternary }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md font-medium text-white text-sm"
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

export default CreateServiceModal;
