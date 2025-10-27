"use client";

import React, { useRef, useState, useEffect } from "react";
import Modal from "@/features/dashboard/components/Modal";
import Colors from "@/shared/theme/colors";
import { Service } from "../../types/typesServices";
import {
  validateServiceField,
  validateServiceForm,
  ServiceErrors,
} from "@/features/dashboard/services/validations/servicesValidation";
import { showWarning } from "@/shared/utils/notifications";

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Service, "id" | "state">) => void;
  services: Service[];
}

const categories = [
  "Mantenimiento Correctivo",
  "Mantenimiento Preventivo",
  "Instalación",
];

const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  services,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | string | undefined>(undefined);
  const [errors, setErrors] = useState<ServiceErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCircleClick = () => fileInputRef.current?.click();

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setImage(undefined);
    setErrors({});
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  type ServiceFieldValue = string | File | undefined;

  const validateField = (
    field: keyof Omit<Service, "id" | "state">,
    value: ServiceFieldValue
  ) => {
    const error = validateServiceField(field, value, services);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Omit<Service, "id" | "state"> = {
      name,
      description,
      category,
      image: image as string,
    };

    const formErrors = validateServiceForm(data, services);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      showWarning("Por favor completa los campos requeridos");
      return;
    }

    onSave(data);
    resetForm();
    onClose();
  };

  const imageName = image instanceof File ? image.name : "";

  return (
    <Modal
      title="Crear Servicio"
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      footer={
        <>
          <div className="border-t border-gray-300 mt-3 mb-2"></div>
          <div className="flex justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer transition duration-300 hover:bg-gray-200 hover:text-black hover:scale-105 px-4 py-2 rounded-lg bg-gray-300 text-black w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="create-service-form"
              className="cursor-pointer transition duration-300 hover:bg-black hover:text-white hover:scale-105 px-4 py-2 rounded-lg bg-black text-white w-full sm:w-auto"
            >
              Guardar
            </button>
          </div>
        </>
      }
    >
      <form
        id="create-service-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-3 p-1"
      >
        {/* Imagen */}
        <div className="col-span-2 flex flex-col items-center mb-3">
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Imagen <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              setImage(file ?? undefined);
              validateField("image", file);
            }}
          />
          <div
            className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer mb-1 overflow-hidden"
            onClick={handleCircleClick}
            style={{ borderColor: errors.image ? "red" : Colors.table.lines }}
          >
            {image ? (
              <img
                src={image instanceof File ? URL.createObjectURL(image) : image}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            )}
          </div>

          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">
              Haga clic en el círculo para {image ? "cambiar" : "seleccionar"} la
              imagen
            </div>

            {image && (
              <div className="flex flex-col items-center space-y-1">
                {imageName && (
                  <div className="text-xs text-green-600 font-medium">
                    {imageName}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setImage(undefined);
                    validateField("image", undefined);
                  }}
                  className="text-red-500 text-xs hover:text-red-700 px-2 py-1 border border-red-200 rounded-md"
                  style={{ borderColor: Colors.states.nullable }}
                >
                  Eliminar imagen
                </button>
              </div>
            )}

            {errors.image && (
              <span className="text-xs text-red-500 mt-1">{errors.image}</span>
            )}
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ingrese nombre"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              validateField("name", e.target.value);
            }}
            onBlur={() => validateField("name", name)}
            className="w-full px-2 py-1 border rounded-md"
            style={{ borderColor: errors.name ? "red" : Colors.table.lines }}
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name}</span>
          )}
        </div>

        {/* Categoría */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              validateField("category", e.target.value);
            }}
            onBlur={() => validateField("category", category)}
            className="w-full px-2 py-1 border rounded-md"
            style={{ borderColor: errors.category ? "red" : Colors.table.lines }}
          >
            <option value="">Seleccione categoría</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="text-xs text-red-500">{errors.category}</span>
          )}
        </div>

        {/* Descripción */}
        <div className="col-span-2">
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Descripción
          </label>
          <textarea
            placeholder="Ingrese descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5} // ← antes eran 3, ahora es un poco más alto
            className="w-full px-2 py-1 border rounded-md resize-none"
            style={{ borderColor: Colors.table.lines }}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateServiceModal;
