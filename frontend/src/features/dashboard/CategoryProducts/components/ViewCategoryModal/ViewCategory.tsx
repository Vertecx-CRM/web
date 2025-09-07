import React from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { useViewCategory } from "../../hooks/useCategories";
import { ViewCategoryModalProps } from "../../types/typeCategoryProducts";

export const ViewCategoryModal: React.FC<ViewCategoryModalProps> = ({
    isOpen,
    category,
    onClose,
}) => {
    const { currentIcon } = useViewCategory(category);

    if (!isOpen || !category) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
            <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md relative z-50 mx-auto">
                <button onClick={onClose} className="absolute top-3 right-3 z-10">
                    <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
                </button>

                <div className="px-4 py-3 rounded-t-lg text-black font-semibold text-2xl">
                    Ver Categoría de producto
                </div>

                <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>

                <div className="p-4 space-y-4">
                    {/* Icono */}
                    <div>
                        <div className="flex flex-col items-center">
                            {currentIcon ? (
                                <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-50 mb-2">
                                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white">
                                        <img
                                            src={URL.createObjectURL(currentIcon)}
                                            alt="Icono de categoría"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 mb-2">
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
                                </div>
                            )}

                            <div className="text-center">
                                <div className="text-xs text-gray-500 mb-1">
                                    {currentIcon ? "Icono de la categoría" : "No hay icono seleccionado"}
                                </div>

                                {currentIcon && (
                                    <div className="text-xs text-green-600 font-medium">
                                        {currentIcon.name || "Icono de categoría"}
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
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            <span className="text-gray-700">{category.nombre}</span>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                            Descripción
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 min-h-[80px]">
                            <span className="text-gray-700 whitespace-pre-wrap">{category.descripcion}</span>
                        </div>
                    </div>

                    {/* Estado */}
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                            Estado
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            <span
                                className="rounded-full px-2 py-0.5 text-xs font-medium"
                                style={{
                                    color: category.estado === "Activo" ? Colors.states.success : Colors.states.inactive,
                                }}
                            >
                                {category.estado}
                            </span>
                        </div>
                    </div>

                    {/* Botón de Cerrar */}
                    <div className="flex justify-end space-x-3 pt-4">
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
                    </div>
                </div>
                <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>
            </div>
        </div>,
        document.body
    );
};

export default ViewCategoryModal;