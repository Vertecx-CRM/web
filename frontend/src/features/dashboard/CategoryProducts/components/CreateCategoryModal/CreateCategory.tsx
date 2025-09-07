import React, { useRef } from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { useCreateCategoryForm } from "../../hooks/useCategories";
import { CreateCategoryModalProps } from "../../types/typeCategoryProducts";

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const {
    formData,
    errors,
    touched,
    handleInputChange,
    handleIconChange,
    handleBlur,
    handleSubmit
  } = useCreateCategoryForm({ isOpen, onClose, onSave });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCircleClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md relative z-50 mx-auto">
        <button onClick={onClose} className="absolute top-3 right-3 z-10">
          <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
        </button>

        <div className="px-4 py-3 rounded-t-lg text-black font-semibold text-2xl">
          Crear Categoría de producto
        </div>

        <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">

          {/* Icono */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Icono
            </label>
            <div className="flex flex-col items-center">
              <input
                type="file"
                name="icono"
                onChange={handleIconChange}
                className="hidden"
                id="icono-upload"
                accept="image/*"
                ref={fileInputRef}
              />

              {/* Círculo del icono - Clickable */}
              <div
                className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors mb-2 cursor-pointer"
                onClick={handleCircleClick}
                style={{ borderColor: Colors.table.lines }}
              >
                {formData.icono ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white">
                    <img
                      src={URL.createObjectURL(formData.icono)}
                      alt="Icono de categoría"
                      className="w-full h-full object-cover"
                    />
                  </div>
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

              {/* Texto y botones de acción */}
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">
                  {formData.icono ? "Haga clic en el círculo para cambiar el icono" : "Haga clic en el círculo para seleccionar un icono"}
                </div>

                {formData.icono && (
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xs text-green-600 font-medium">
                      {formData.icono.name || "Icono seleccionado"}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIconChange({
                          target: { files: null }
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      className="text-red-500 text-xs hover:text-red-700 px-2 py-1 border border-red-200 rounded-md"
                      style={{ borderColor: Colors.states.nullable }}
                    >
                      Eliminar icono
                    </button>
                  </div>
                )}

                {!formData.icono && (
                  <div className="text-xs text-gray-500">
                    (Opcional)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Ingrese el nombre de la categoría del producto"
              value={formData.nombre}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{
                borderColor: errors.nombre && touched.nombre ? "red" : Colors.table.lines,
              }}
            />
            {errors.nombre && touched.nombre && (
              <span className="text-red-500 text-xs mt-1">{errors.nombre}</span>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Descripción
            </label>
            <textarea
              name="descripcion"
              placeholder="Ingrese la descripción de la categoría del producto"
              value={formData.descripcion}
              onChange={handleInputChange}
              onBlur={handleBlur}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{
                borderColor: errors.descripcion && touched.descripcion ? 'red' : Colors.table.lines,
              }}
            />
            {errors.descripcion && touched.descripcion && (
              <span className="text-red-500 text-xs mt-1">{errors.descripcion}</span>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors text-sm"
              style={{
                backgroundColor: Colors.buttons.tertiary,
                color: Colors.texts.quaternary,
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md font-medium text-white text-sm"
              style={{
                backgroundColor: Colors.buttons.quaternary,
                color: Colors.texts.quaternary,
              }}
            >
              Guardar
            </button>
          </div>
        </form>
        <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>
      </div>
    </div>,
    document.body
  );
};

export default CreateCategoryModal;