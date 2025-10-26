"use client";
import React from "react";

import "react-toastify/dist/ReactToastify.css";
import Colors from "@/shared/theme/colors";
import { CreateUserModalProps } from "../../types/typesUser";
import { useCreateUserForm } from "../../hooks/useCreateUserForm";
import { useDocumentTypes } from "../../hooks/useDocumentTypes";
import Modal from "@/features/dashboard/components/Modal";

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const {
    formData,
    errors,
    touched,
    previewImage,
    isSubmitting,
    handleInputChange,
    handleImageChange,
    handleBlur,
    handleSubmit,
    removeImage,
  } = useCreateUserForm({
    isOpen,
    onClose,
    onSave,
  });

  const { documentTypes, loading } = useDocumentTypes();

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e.target.name as keyof typeof formData, e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    handleInputChange(e.target.name as keyof typeof formData, value);
  };

  // ✅ Footer con botones estándar
  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-md font-medium text-sm"
        style={{
          backgroundColor: Colors.buttons.tertiary,
          color: Colors.texts.quaternary,
        }}
      >
        Cancelar
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 rounded-md font-medium text-sm disabled:opacity-50"
        style={{
          backgroundColor: Colors.buttons.quaternary,
          color: Colors.texts.quaternary,
        }}
        form="create-user-form"
      >
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>
    </>
  );

  if (!isOpen) return null;

  return (
    <Modal
      title="Crear Usuario"
      isOpen={isOpen}
      onClose={onClose}
      footer={footer}
      widthClass="max-w-md"
    >
      <form
        id="create-user-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Tipo y número de documento */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: Colors.texts.primary }}
          >
            Documento
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Tipo */}
            <select
              name="typeid"
              value={formData.typeid}
              onChange={handleSelectChange}
              onBlur={() => handleBlur("typeid")}
              className="w-full sm:w-32 px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
              style={{
                borderColor:
                  errors.typeid && touched.typeid
                    ? "red"
                    : Colors.table.lines,
              }}
            >
              <option value={0}>Seleccione tipo</option>
              {loading ? (
                <option>Cargando...</option>
              ) : (
                documentTypes.map((doc) => (
                  <option
                    key={doc.typeofdocumentid}
                    value={doc.typeofdocumentid}
                  >
                    {doc.name}
                  </option>
                ))
              )}
            </select>

            {/* Número */}
            <div className="flex-1 flex flex-col">
              <input
                type="text"
                name="documentnumber"
                placeholder="Número de documento"
                value={formData.documentnumber}
                onChange={handleTextChange}
                onBlur={() => handleBlur("documentnumber")}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
                style={{
                  borderColor:
                    errors.documentnumber && touched.documentnumber
                      ? "red"
                      : Colors.table.lines,
                }}
              />
              {errors.documentnumber && touched.documentnumber && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.documentnumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              placeholder="Ingrese su nombre"
              value={formData.name}
              onChange={handleTextChange}
              onBlur={() => handleBlur("name")}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
              style={{
                borderColor:
                  errors.name && touched.name ? "red" : Colors.table.lines,
              }}
            />
            {errors.name && touched.name && (
              <span className="text-red-500 text-xs mt-1">
                {errors.name}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Apellido</label>
            <input
              type="text"
              name="lastname"
              placeholder="Ingrese su apellido"
              value={formData.lastname}
              onChange={handleTextChange}
              onBlur={() => handleBlur("lastname")}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
              style={{
                borderColor:
                  errors.lastname && touched.lastname
                    ? "red"
                    : Colors.table.lines,
              }}
            />
            {errors.lastname && touched.lastname && (
              <span className="text-red-500 text-xs mt-1">
                {errors.lastname}
              </span>
            )}
          </div>
        </div>

        {/* Teléfono y Correo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              name="phone"
              placeholder="Ingrese su teléfono"
              value={formData.phone}
              onChange={handleTextChange}
              onBlur={() => handleBlur("phone")}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
              style={{
                borderColor:
                  errors.phone && touched.phone
                    ? "red"
                    : Colors.table.lines,
              }}
            />
            {errors.phone && touched.phone && (
              <span className="text-red-500 text-xs mt-1">
                {errors.phone}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Correo</label>
            <input
              type="email"
              name="email"
              placeholder="Ingrese su correo"
              value={formData.email}
              onChange={handleTextChange}
              onBlur={() => handleBlur("email")}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
              style={{
                borderColor:
                  errors.email && touched.email
                    ? "red"
                    : Colors.table.lines,
              }}
            />
            {errors.email && touched.email && (
              <span className="text-red-500 text-xs mt-1">
                {errors.email}
              </span>
            )}
          </div>
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium mb-1">Imagen</label>
          <div className="border border-dashed border-gray-300 rounded-md p-2 text-center flex flex-col items-center justify-center gap-2">
            {previewImage ? (
              <>
                <img
                  src={previewImage}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="text-xs text-red-500 underline"
                >
                  Eliminar imagen
                </button>
              </>
            ) : (
              <>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-xs text-gray-500"
                >
                  Haga clic para cargar imagen
                </label>
              </>
            )}
          </div>
        </div>

        {/* Contraseña y Confirmación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              placeholder="Ingrese una contraseña"
              value={formData.password}
              onChange={handleTextChange}
              onBlur={() => handleBlur("password")}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirme la contraseña"
              value={formData.confirmPassword}
              onChange={handleTextChange}
              onBlur={() => handleBlur("confirmPassword")}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
