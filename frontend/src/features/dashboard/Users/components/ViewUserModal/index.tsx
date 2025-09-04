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
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative z-50">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10"
                    >
                        <img
                            src="/icons/X.svg"
                            alt="Cerrar"
                            className="w-6 h-6"
                        />
                    </button>

                    {/* Header */}
                    <div className="px-6 py-4 rounded-t-lg text-black font-semibold text-3xl">
                        Ver usuario
                    </div>

                    <div className="w-110 h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>

                    {/* Contenido */}
                    <div className="p-6 space-y-4">
                        {/* Foto del usuario - Usa user.imagen en lugar de user.foto */}
                        <div className="flex justify-center mb-4">
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {user.imagen ? (
                                    <img
                                        src={user.imagen}
                                        alt="Foto de perfil"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-500 text-2xl">
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
                            <div className="flex gap-0.5">
                                {/* Tipo de documento (solo lectura) */}
                                <div className="flex relative">
                                    <div
                                        className="w-19 px-3 py-2 border border-gray-300 rounded-md "
                                        style={{ borderColor: Colors.table.lines }}
                                    >
                                        {user.documento}
                                    </div>
                                </div>

                                {/* Número de documento (solo lectura) */}
                                <div className="flex-2 flex flex-col">
                                    <div
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md "
                                        style={{ borderColor: Colors.table.lines }}
                                    >
                                        {user.numeroDocumento}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                    Nombre
                                </label>
                                <div
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md "
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md "
                                    style={{ borderColor: Colors.table.lines }}
                                >
                                    {lastName}
                                </div>
                            </div>
                        </div>

                        {/* Teléfono y Email */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                    Teléfono
                                </label>
                                <div
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md "
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md "
                                    style={{ borderColor: Colors.table.lines }}
                                >
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        {/* Rol */}
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                Rol
                            </label>
                            <div
                                className="w-full px-3 py-2 border border-gray-300 rounded-md "
                                style={{ borderColor: Colors.table.lines }}
                            >
                                {user.rol}
                            </div>
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                                Estado
                            </label>
                            <div
                                className="w-full px-3 py-2 border border-gray-300 rounded-md "
                                style={{ borderColor: Colors.table.lines }}
                            >
                                {user.estado}
                            </div>
                        </div>

                        {/* Botón */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-md font-medium"
                                style={{
                                    backgroundColor: Colors.buttons.tertiary,
                                    color: Colors.texts.quaternary,
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                        <div className="w-108 h-0 outline outline-1 outline-offset-[-0.5px] outline-black mx-auto"></div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

export default ViewUserModal;