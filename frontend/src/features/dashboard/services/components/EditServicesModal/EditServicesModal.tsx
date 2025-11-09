"use client";

import React, { useState, useEffect, useRef } from "react";
import Modal from "@/features/dashboard/components/Modal";
import Colors from "@/shared/theme/colors";
import { Service } from "../../types/typesServices";
import { showWarning } from "@/shared/utils/notifications";
import Image from "next/image";

interface EditServiceModalProps {
  isOpen: boolean;
  service: Service | null;
  onClose: () => void;
  onSave: (updatedService: Service) => void;
  services: Service[];
}

const categories = [
  "Mantenimiento Correctivo",
  "Mantenimiento Preventivo",
  "Instalación",
];

interface ServiceErrors {
  nombre?: string;
  categoria?: string;
  imagen?: string;
}

type ServiceFieldValue = string | File | null;

const EditServiceModal: React.FC<EditServiceModalProps> = ({
  isOpen,
  service,
  onClose,
  onSave,
  services,
}) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagen, setImagen] = useState<File | string | null>(null);
  const [estado, setEstado] = useState<"Activo" | "Inactivo">("Activo");
  const [errors, setErrors] = useState<ServiceErrors>({});
  const [isImagenEliminada, setIsImagenEliminada] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && service) {
      setNombre(service.name);
      setDescripcion(service.description || "");
      setCategoria(service.category);
      setEstado(service.state);

      if (typeof service.image === "string" && service.image.trim() !== "") {
        setImagen(service.image);
        setIsImagenEliminada(false);
      } else {
        setImagen(null);
        setIsImagenEliminada(false);
      }

      setErrors({});
    }
  }, [isOpen, service]);

  const handleCircleClick = () => fileInputRef.current?.click();

  const validateNombre = (value: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (!value.trim()) {
        newErrors.nombre = "El nombre es obligatorio";
      } else if (
        services.some(
          (s) =>
            s.name.toLowerCase() === value.toLowerCase() && s.id !== service?.id
        )
      ) {
        newErrors.nombre = "Ya existe un servicio con este nombre";
      } else {
        delete newErrors.nombre;
      }
      return newErrors;
    });
  };

  const validateField = (
    field: keyof ServiceErrors,
    value: ServiceFieldValue
  ) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (field === "categoria") {
        if (!value || (typeof value === "string" && value.trim() === "")) {
          newErrors.categoria = "La categoría es obligatoria";
        } else {
          delete newErrors.categoria;
        }
      }

      if (field === "imagen") {
        if (!value && !isImagenEliminada) {
          newErrors.imagen = "La imagen es obligatoria";
        } else {
          delete newErrors.imagen;
        }
      }

      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    validateNombre(nombre);
    validateField("categoria", categoria);
    validateField(
      "imagen",
      imagen && !isImagenEliminada
        ? typeof imagen === "string"
          ? imagen
          : ""
        : null
    );

    if (
      !nombre ||
      !categoria ||
      errors.nombre ||
      errors.categoria ||
      (!imagen && isImagenEliminada)
    ) {
      showWarning(
        "Por favor completa todos los campos obligatorios y corrige los errores"
      );
      return;
    }

    if (!service) return;

    onSave({
      id: service.id,
      name: nombre,
      description: descripcion,
      category: categoria,
      image: isImagenEliminada ? null : imagen,
      state: estado,
    });

    onClose();
  };

  const nombreImagen = imagen instanceof File ? imagen.name : "";

  return (
    <Modal
      title="Editar Servicio"
      isOpen={isOpen}
      onClose={onClose}
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
              form="edit-service-form"
              className="cursor-pointer transition duration-300 hover:bg-black hover:text-white hover:scale-105 px-4 py-2 rounded-lg bg-black text-white w-full sm:w-auto"
            >
              Guardar
            </button>
          </div>
        </>
      }
    >
      <form
        id="edit-service-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-3 p-1 overflow-hidden"
      >
        {/* Imagen */}
        <div className="col-span-2 flex flex-col items-center mb-3">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              setImagen(e.target.files?.[0] ?? null);
              setIsImagenEliminada(false);
              validateField("imagen", e.target.files?.[0] ? "" : null);
            }}
          />
          <div
            className="relative w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer mb-1 overflow-hidden"
            onClick={handleCircleClick}
            style={{ borderColor: errors.imagen ? "red" : Colors.table.lines }}
          >
            {!isImagenEliminada && imagen ? (
              <Image
                src={
                  imagen instanceof File ? URL.createObjectURL(imagen) : imagen
                }
                alt="Servicio"
                className="rounded-full object-cover"
                onError={() => setImagen(null)}
                fill
                sizes="80px"
                unoptimized
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
              Haga clic en el círculo para{" "}
              {!isImagenEliminada && imagen ? "cambiar" : "seleccionar"} la
              imagen
            </div>

            {!isImagenEliminada && imagen && (
              <div className="flex flex-col items-center space-y-1">
                {nombreImagen && (
                  <div className="text-xs text-green-600 font-medium">
                    {nombreImagen}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setImagen(null);
                    setIsImagenEliminada(true);
                    validateField("imagen", null);
                  }}
                  className="text-red-500 text-xs hover:text-red-700 px-2 py-1 border border-red-200 rounded-md"
                  style={{ borderColor: Colors.states?.nullable }}
                >
                  Eliminar imagen
                </button>
              </div>
            )}

            {errors.imagen && (
              <span className="text-xs text-red-500 mt-1">{errors.imagen}</span>
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
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              validateNombre(e.target.value);
            }}
            onBlur={() => validateNombre(nombre)}
            className="w-full px-2 py-1 border rounded-md"
            style={{ borderColor: errors.nombre ? "red" : Colors.table.lines }}
          />
          {errors.nombre && (
            <span className="text-xs text-red-500">{errors.nombre}</span>
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
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);
              validateField("categoria", e.target.value);
            }}
            onBlur={() => validateField("categoria", categoria)}
            className="w-full px-2 py-1 border rounded-md"
            style={{
              borderColor: errors.categoria ? "red" : Colors.table.lines,
            }}
          >
            <option value="">Seleccione categoría</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.categoria && (
            <span className="text-xs text-red-500">{errors.categoria}</span>
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
          <div
            className="border rounded-md"
            style={{ borderColor: Colors.table.lines }}
          >
            <textarea
              placeholder="Ingrese descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full max-h-28 min-h-24 px-2 py-1 resize-none overflow-y-auto outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Estado
          </label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as "Activo" | "Inactivo")}
            className="w-full px-2 py-1 border rounded-md"
            style={{ borderColor: Colors.table.lines }}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};

export default EditServiceModal;
