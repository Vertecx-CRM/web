"use client";
import React, { useEffect, useState } from "react";
import Colors from "@/shared/theme/colors";
import { ViewUserModalProps } from "../../types/typesUser";
import Modal from "@/features/dashboard/components/Modal";

const ViewUserModal: React.FC<ViewUserModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const stateMap: Record<number, string> = {
    1: "Activo",
    2: "Inactivo",
  };

  useEffect(() => {
    setImageUrl(user?.image || null);
  }, [user?.image]);

  if (!isOpen || !user) return null;

  const documentTypeName =
    user.typeofdocuments?.name || "Sin tipo de documento";

  // ✅ Footer del modal
  const footer = (
    <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 rounded-md font-medium text-white text-sm"
      style={{
        backgroundColor: Colors.buttons.quaternary,
        color: Colors.texts.quaternary,
      }}
    >
      Cerrar
    </button>
  );

  return (
    <Modal
      title="Ver Usuario"
      isOpen={isOpen}
      onClose={onClose}
      widthClass="max-w-md"
      footer={footer}
    >
      <div className="space-y-5">
        {/* Imagen del usuario */}
        <div className="flex flex-col items-center">
          {imageUrl ? (
            <div className="w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-50 mb-2 overflow-hidden">
              <img
                src={imageUrl}
                alt="Foto de usuario"
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 mb-2">
              <span className="text-gray-500 text-xl font-medium">
                {user.name.charAt(0)}
                {user.lastname.charAt(0)}
              </span>
            </div>
          )}
          <p className="text-xs text-gray-500">
            {imageUrl ? "Foto de perfil" : "Sin imagen"}
          </p>
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
            {/* Tipo */}
            <div className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {documentTypeName}
            </div>
            {/* Número */}
            <div className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
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
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
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
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
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
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
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
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {user.email}
            </div>
          </div>
        </div>

        {/* Rol */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Rol
          </label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
            {user.roleconfiguration?.roles?.name || "Sin rol"}
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
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${user.stateid === 1
                  ? "text-green-600 bg-green-100"
                  : "text-gray-500 bg-gray-100"
                }`}
            >
              {stateMap[user.stateid] || "Desconocido"}
            </span>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user.createat && (
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: Colors.texts.primary }}
              >
                Creado el
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
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
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                {new Date(user.updateat).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewUserModal;
