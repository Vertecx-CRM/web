// components/ViewUserModal/index.tsx
import React from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { User } from "../../types";

interface ViewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export const ViewUserModal: React.FC<ViewUserModalProps> = ({
    isOpen,
    onClose,
    user,
}) => {
    if (!isOpen || !user) return null;

    // Función para dividir el nombre completo en nombre y apellido
    const splitName = (fullName: string) => {
        const names = fullName.trim().split(/\s+/);

        // Casos especiales:
        if (names.length === 0) return { firstName: "", lastName: "" };
        if (names.length === 1) return { firstName: names[0], lastName: "" };

        // Para 2 palabras: primera = nombre, segunda = apellido
        if (names.length === 2) return { firstName: names[0], lastName: names[1] };

        // Para 3 palabras: primeras dos = nombre, tercera = apellido
        if (names.length === 3) return {
            firstName: `${names[0]} ${names[1]}`,
            lastName: names[2]
        };

        // Para 4 o más palabras: primeras dos = nombre, resto = apellidos
        return {
            firstName: `${names[0]} ${names[1]}`,
            lastName: names.slice(2).join(" ")
        };
    };

    const { firstName, lastName } = splitName(user.nombre);

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
                        Ver usuario
                    </div>

                    <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>

                    {/* Contenido */}
                    <div className="p-4 md:p-6 space-y-4">
                        {/* Foto del usuario - Usa user.imagen en lugar de user.foto */}
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {user.imagen ? (
                                    <img
                                        src={user.imagen}
                                        alt="Foto de perfil"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-500 text-xl md:text-2xl">
                                        {firstName.charAt(0)}{lastName.charAt(0)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Documento */}
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                Documento
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                {/* Tipo de documento (solo lectura) */}
                                <div className="flex relative w-full sm:w-auto">
                                    <div
                                        className="w-full sm:w-24 px-3 py-2 border border-gray-300 rounded-md"
                                        style={{ borderColor: Colors.table.lines }}
                                    >
                                        {user.documento}
                                    </div>
                                </div>

                                {/* Número de documento (solo lectura) */}
                                <div className="flex-1 flex flex-col">
                                    <div
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        style={{ borderColor: Colors.table.lines }}
                                    >
                                        {user.numeroDocumento}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                    Nombre
                                </label>
                                <div
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    style={{ borderColor: Colors.table.lines }}
                                >
                                    {firstName}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                    Apellido
                                </label>
                                <div
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    style={{ borderColor: Colors.table.lines }}
                                >
                                    {lastName}
                                </div>
                            </div>
                        </div>

                        {/* Teléfono y Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                    Teléfono
                                </label>
                                <div
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    style={{ borderColor: Colors.table.lines }}
                                >
                                    {user.telefono}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                    Correo Electrónico
                                </label>
                                <div
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    style={{ borderColor: Colors.table.lines }}
                                >
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        {/* Rol y Estado */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                    Rol
                                </label>
                                <div
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    style={{ borderColor: Colors.table.lines }}
                                >
                                    {user.rol}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                    Estado
                                </label>
                                <div
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    style={{ borderColor: Colors.table.lines }}
                                >
                                    {user.estado}
                                </div>
                            </div>
                        </div>

                        {/* Botón */}
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
                        <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

export default ViewUserModal;