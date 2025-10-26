import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { ViewUserModalProps } from "../../types/typesUser";

export const ViewUserModal: React.FC<ViewUserModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Mapeos de IDs a etiquetas legibles
  const documentTypeMap: Record<number, string> = {
    1: "CC",
    2: "CE",
    3: "TI",
    4: "NIT",
    5: "PAS",
  };

  const stateMap: Record<number, string> = {
    1: "Activo",
    2: "Inactivo",
  };

  // Efecto para manejar la imagen (string URL)
  useEffect(() => {
    if (user?.image) {
      setImageUrl(user.image);
    } else {
      setImageUrl(null);
    }
  }, [user?.image]);

  if (!isOpen || !user) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-lg relative z-50 max-h-[90vh] overflow-y-auto">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 md:top-4 md:right-4 z-10"
        >
          <img
            src="/icons/X.svg"
            alt="Cerrar"
            className="w-5 h-5 md:w-6 md:h-6"
          />
        </button>

        {/* Header */}
        <div className="px-4 md:px-6 py-3 md:py-4 text-black font-semibold text-2xl md:text-3xl">
          Ver usuario
        </div>

        <div className="w-full border-t border-black/10 mb-4"></div>

        {/* Contenido */}
        <div className="p-4 md:p-6 space-y-4">
          {/* Imagen */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-gray-500 text-xl md:text-2xl">
                  {user.name.charAt(0)}
                  {user.lastname.charAt(0)}
                </span>
              )}
            </div>
          </div>

          {/* Documento */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Documento
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div
                className="w-full sm:w-24 px-3 py-2 border rounded-md text-gray-700 bg-gray-50"
                style={{ borderColor: Colors.table.lines }}
              >
                {documentTypeMap[user.typeid] || "N/A"}
              </div>
              <div
                className="flex-1 px-3 py-2 border rounded-md text-gray-700 bg-gray-50"
                style={{ borderColor: Colors.table.lines }}
              >
                {user.documentnumber}
              </div>
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: Colors.texts.primary }}
              >
                Nombre
              </label>
              <div
                className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700"
                style={{ borderColor: Colors.table.lines }}
              >
                {user.name}
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: Colors.texts.primary }}
              >
                Apellido
              </label>
              <div
                className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700"
                style={{ borderColor: Colors.table.lines }}
              >
                {user.lastname}
              </div>
            </div>
          </div>

          {/* Teléfono y Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: Colors.texts.primary }}
              >
                Teléfono
              </label>
              <div
                className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700"
                style={{ borderColor: Colors.table.lines }}
              >
                {user.phone}
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: Colors.texts.primary }}
              >
                Correo Electrónico
              </label>
              <div
                className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700"
                style={{ borderColor: Colors.table.lines }}
              >
                {user.email}
              </div>
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
            <div
              className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700"
              style={{
                borderColor: Colors.table.lines,
                color:
                  user.stateid === 1
                    ? Colors.states.success
                    : Colors.states.inactive,
              }}
            >
              {stateMap[user.stateid] || "Desconocido"}
            </div>
          </div>

          {/* Fechas de creación y actualización */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.createat && (
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: Colors.texts.primary }}
                >
                  Creado el
                </label>
                <div
                  className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700"
                  style={{ borderColor: Colors.table.lines }}
                >
                  {new Date(user.createat).toLocaleString()}
                </div>
              </div>
            )}
            {user.updateat && (
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: Colors.texts.primary }}
                >
                  Actualizado el
                </label>
                <div
                  className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700"
                  style={{ borderColor: Colors.table.lines }}
                >
                  {new Date(user.updateat).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Botón cerrar */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium w-full sm:w-auto"
              style={{
                backgroundColor: Colors.buttons.tertiary,
                color: Colors.texts.quaternary,
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ViewUserModal;
