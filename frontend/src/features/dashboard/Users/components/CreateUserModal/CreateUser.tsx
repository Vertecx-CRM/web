"use client";
import React from "react";
import "react-toastify/dist/ReactToastify.css";
import Colors from "@/shared/theme/colors";
import { CreateUserModalProps } from "../../types/typesUser";
import { useCreateUserForm } from "../../hooks/useCreateUserForm";
import { useDocumentTypes } from "../../hooks/useDocumentTypes";
import { useRoles } from "../../hooks/useRoles";
import { useTechnicianTypes } from "../../hooks/useTechnicianTypes";
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
    previewCV,
    isSubmitting,
    handleInputChange,
    handleImageChange,
    handleCVChange,
    handleBlur,
    handleSubmit,
    removeImage,
    removeCV,
    handleTechnicianTypeChange,
  } = useCreateUserForm({ isOpen, onClose, onSave });

  const { documentTypes, loading: loadingDocuments } = useDocumentTypes();
  const { roles, loading: loadingRoles } = useRoles();
  const { technicianTypes, loading: loadingTechnicianTypes } = useTechnicianTypes();

  // Determinar el rol seleccionado
  const selectedRole = roles.find(
    (r) => r.roleconfigurationid === formData.roleconfigurationid
  )?.role?.name || "";
  const isTecnico = selectedRole.toLowerCase() === "tecnico";
  const isCliente = selectedRole.toLowerCase() === "cliente";

  // 🔹 Manejar inputs de texto
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e.target.name as keyof typeof formData, e.target.value);
  };

  // 🔹 Manejar selects (especialmente el rol)
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const field = e.target.name as keyof typeof formData;
    const value = Number(e.target.value);

    // Si el campo es "roleconfigurationid", guarda también el nombre del rol
    if (field === "roleconfigurationid") {
      const selected = roles.find((r) => r.roleconfigurationid === value);

      // Guardar ID y nombre dentro de roleconfiguration
      handleInputChange("roleconfigurationid", value);
      handleInputChange(
        "roleconfiguration",
        {
          roleconfigurationid: value,
          roles: { name: selected?.role?.name || "" },
        } as any
      );
    } else {
      handleInputChange(field, value);
    }
  };

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
      widthClass="max-w-2xl"
    >
      <form id="create-user-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Documento */}
        <div>
          <label className="block text-sm font-medium mb-1">Documento</label>
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Tipo de documento */}
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
              {loadingDocuments ? (
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
              <span className="text-red-500 text-xs mt-1">{errors.name}</span>
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

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium mb-1">Rol</label>
          <select
            name="roleconfigurationid"
            value={formData.roleconfigurationid}
            onChange={handleSelectChange}
            onBlur={() => handleBlur("roleconfigurationid")}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
            style={{
              borderColor:
                errors.roleconfigurationid && touched.roleconfigurationid
                  ? "red"
                  : Colors.table.lines,
            }}
          >
            <option value={0}>Seleccione un rol</option>
            {loadingRoles ? (
              <option>Cargando roles...</option>
            ) : roles.length === 0 ? (
              <option>No hay roles disponibles</option>
            ) : (
              roles.map((r) => (
                <option
                  key={r.roleconfigurationid}
                  value={r.roleconfigurationid}
                >
                  {r.role?.name}
                </option>
              ))
            )}
          </select>
          {errors.roleconfigurationid && touched.roleconfigurationid && (
            <span className="text-red-500 text-xs mt-1">
              {errors.roleconfigurationid}
            </span>
          )}
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

        {/* 🛠 Campos para Técnico */}
        {isTecnico && (
          <>
            {/* CV */}
            <div>
              <label className="block text-sm font-medium mb-1">
                CV (PDF, DOC, DOCX)
              </label>
              <div
                className="border border-dashed rounded-md p-2 text-center flex flex-col items-center justify-center gap-2"
                style={{
                  borderColor:
                    errors.CV && touched.CV ? "red" : Colors.table.lines,
                }}
              >
                {previewCV ? (
                  <>
                    <span className="text-sm text-gray-600">
                      Archivo: {previewCV}
                    </span>
                    <button
                      type="button"
                      onClick={removeCV}
                      className="text-xs text-red-500 underline"
                    >
                      Eliminar CV
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="file"
                      id="cv-upload"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleCVChange}
                      onBlur={() => handleBlur("CV")}
                    />
                    <label
                      htmlFor="cv-upload"
                      className="cursor-pointer text-xs text-gray-500"
                    >
                      Haga clic para cargar CV
                    </label>
                  </>
                )}
              </div>
              {errors.CV && touched.CV && (
                <span className="text-red-500 text-xs mt-1">{errors.CV}</span>
              )}
            </div>

            {/* Tipos de Técnico */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tipos de Técnico
              </label>
              {loadingTechnicianTypes ? (
                <p className="text-sm text-gray-500">Cargando tipos...</p>
              ) : technicianTypes.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay tipos de técnico disponibles
                </p>
              ) : (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded bg-gray-50"
                  style={{
                    borderColor:
                      errors.techniciantypeids && touched.techniciantypeids
                        ? "red"
                        : Colors.table.lines,
                  }}
                >
                  {technicianTypes.map((type) => (
                    <label
                      key={type.techniciantypeid}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={
                          formData.techniciantypeids?.includes(
                            type.techniciantypeid
                          ) || false
                        }
                        onChange={(e) =>
                          handleTechnicianTypeChange(
                            type.techniciantypeid,
                            e.target.checked
                          )
                        }
                        onBlur={() => handleBlur("techniciantypeids")}
                      />
                      <span className="text-sm">{type.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {errors.techniciantypeids && touched.techniciantypeids && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.techniciantypeids}
                </span>
              )}
            </div>
          </>
        )}

        {/* 🏠 Campos para Cliente */}
        {isCliente && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ciudad</label>
              <input
                type="text"
                name="customercity"
                placeholder="Ciudad"
                value={formData.customercity || ""}
                onChange={(e) => handleInputChange("customercity", e.target.value)}
                onBlur={() => handleBlur("customercity")}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
                style={{
                  borderColor:
                    errors.customercity && touched.customercity
                      ? "red"
                      : Colors.table.lines,
                }}
              />
              {errors.customercity && touched.customercity && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.customercity}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Código Postal
              </label>
              <input
                type="text"
                name="customerzipcode"
                placeholder="Código postal"
                value={formData.customerzipcode || ""}
                onChange={(e) => handleInputChange("customerzipcode", e.target.value)}
                onBlur={() => handleBlur("customerzipcode")}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
                style={{
                  borderColor:
                    errors.customerzipcode && touched.customerzipcode
                      ? "red"
                      : Colors.table.lines,
                }}
              />
              {errors.customerzipcode && touched.customerzipcode && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.customerzipcode}
                </span>
              )}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CreateUserModal;
