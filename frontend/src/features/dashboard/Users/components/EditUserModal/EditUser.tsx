import React from "react";
import { createPortal } from "react-dom";
import "react-toastify/dist/ReactToastify.css";
import Colors from "@/shared/theme/colors";
import { editUserModalProps } from "../../types/typesUser";
import { useEditUserForm } from "../../hooks/useUsers";


export const EditUserModal: React.FC<editUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user
}) => {
  const {
    formData,
    errors,
    touched,
    isSubmitting,
    handleInputChange,
    handleBlur,
    handleSubmit
  } = useEditUserForm({
    isOpen,
    onClose,
    onSave,
    user
  });

  // Función específica para manejar cambios de archivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleInputChange('imagen', file);
  };

  // Función para manejar cambios en selects e inputs
  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleInputChange(event.target.name as keyof typeof formData, event.target.value);
  };

  const getImageSrc = () => {
    if (formData.imagen instanceof File) {
      return URL.createObjectURL(formData.imagen);
    } else if (typeof formData.imagen === 'string') {
      return formData.imagen;
    } else if (user?.imagen) {
      return typeof user.imagen === 'string' ? user.imagen : '';
    }
    return null;
  };

  const imageSrc = getImageSrc();

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-lg relative z-50 max-h-[90vh] overflow-y-auto">
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
          <div className="px-4 md:px-6 py-3 md:py-4 rounded-t-lg text-black font-semibold text-2xl md:text-3xl">
            Editar usuario
          </div>

          <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
            {/* Imagen */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: Colors.texts.primary }}
              >
                Imagen
              </label>

              {/* Contenedor de la imagen que actúa como botón */}
              <div className="flex justify-center mb-2">
                <input
                  type="file"
                  name="imagen"
                  onChange={handleFileChange}
                  className="hidden"
                  id="imagen-upload"
                  accept="image/*"
                />
                <label htmlFor="imagen-upload" className="cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt="Imagen de usuario"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Manejar error de carga de imagen
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-gray-500 text-xs text-center">
                        <img
                          src="/icons/Plus.svg"
                          alt="Agregar imagen"
                          className="w-6 h-6 mx-auto mb-1"
                        />
                        <span>Agregar</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Texto del nombre del archivo seleccionado (solo si hay archivo) */}
              {formData.imagen instanceof File && (
                <div className="text-xs text-green-600 text-center mt-1 truncate">
                  {formData.imagen.name}
                </div>
              )}
            </div>

            {/* Documento */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                Documento
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Select de tipo de documento */}
                <div className="flex relative w-full sm:w-auto">
                  <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleFieldChange}
                    onBlur={() => handleBlur('tipoDocumento')}
                    className="w-full sm:w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                    style={{
                      borderColor: errors.tipoDocumento && touched.tipoDocumento ? 'red' : Colors.table.lines,
                    }}
                  >
                    <option value="" disabled hidden>Seleccione</option>
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="PPT">PPT</option>
                    <option value="TI">TI</option>
                    <option value="RC">RC</option>
                  </select>
                </div>

                {/* Input de número de documento */}
                <div className="flex-1 flex flex-col">
                  <input
                    type="text"
                    name="numeroDocumento"
                    placeholder="Ingrese su documento"
                    value={formData.numeroDocumento}
                    onChange={handleFieldChange}
                    onBlur={() => handleBlur('numeroDocumento')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    style={{
                      borderColor: errors.numeroDocumento && touched.numeroDocumento ? 'red' : Colors.table.lines,
                    }}
                  />
                  {errors.numeroDocumento && touched.numeroDocumento && (
                    <span className="text-red-500 text-xs mt-1">{errors.numeroDocumento}</span>
                  )}
                </div>
              </div>
              {errors.tipoDocumento && touched.tipoDocumento && (
                <span className="text-red-500 text-xs mt-1">{errors.tipoDocumento}</span>
              )}
            </div>

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Ingrese su nombre"
                  value={formData.nombre}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur('nombre')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  style={{
                    borderColor: errors.nombre && touched.nombre ? 'red' : Colors.table.lines,
                  }}
                />
                {errors.nombre && touched.nombre && (
                  <span className="text-red-500 text-xs mt-1">{errors.nombre}</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                  Apellido
                </label>
                <input
                  type="text"
                  name="apellido"
                  placeholder="Ingrese su apellido"
                  value={formData.apellido}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur('apellido')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  style={{
                    borderColor: errors.apellido && touched.apellido ? 'red' : Colors.table.lines,
                  }}
                />
                {errors.apellido && touched.apellido && (
                  <span className="text-red-500 text-xs mt-1">{errors.apellido}</span>
                )}
              </div>
            </div>

            {/* Teléfono y Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Ingrese su teléfono"
                  value={formData.telefono}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur('telefono')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  style={{
                    borderColor: errors.telefono && touched.telefono ? 'red' : Colors.table.lines,
                  }}
                />
                {errors.telefono && touched.telefono && (
                  <span className="text-red-500 text-xs mt-1">{errors.telefono}</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Ingrese su correo electronico"
                  value={formData.email}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur('email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  style={{
                    borderColor: errors.email && touched.email ? 'red' : Colors.table.lines,
                  }}
                />
                {errors.email && touched.email && (
                  <span className="text-red-500 text-xs mt-1">{errors.email}</span>
                )}
              </div>
            </div>

            {/* Estado y Rol */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur('estado')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  style={{
                    borderColor: errors.estado && touched.estado ? 'red' : Colors.table.lines,
                  }}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
                {errors.estado && touched.estado && (
                  <span className="text-red-500 text-xs mt-1">{errors.estado}</span>
                )}
              </div>

              {/* Campo Rol */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                  Rol
                </label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur('rol')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  style={{
                    borderColor: errors.rol && touched.rol ? 'red' : Colors.table.lines,
                  }}
                >
                  <option value="" disabled hidden>Seleccione un rol</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Usuario">Usuario</option>
                  <option value="Editor">Editor</option>
                  <option value="Invitado">Invitado</option>
                </select>
                {errors.rol && touched.rol && (
                  <span className="text-red-500 text-xs mt-1">{errors.rol}</span>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md font-medium mt-2 sm:mt-0"
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
                className="px-4 py-2 rounded-md font-medium disabled:opacity-50"
                style={{
                  backgroundColor: Colors.buttons.quaternary,
                  color: Colors.texts.quaternary,
                }}
              >
                {isSubmitting ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </form>
          <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default EditUserModal;