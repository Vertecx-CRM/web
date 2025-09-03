"use client";

import Colors from "@/shared/theme/colors";
import { useMemo, useState } from "react";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AsideNav from "../layout/AsideNav";
import TopNav from "../layout/TopNav";
import { DataTable, Column } from "../components/DataTable";
import CreateUserModal from "./components/CreateUser";


/** ====== Tipos ====== */
type Row = {
    id: number;
    documento: string;      // Tipo de documento (CC, PPT, etc.)
    numeroDocumento: string; // Número de documento
    nombre: string;         // Nombre completo del usuario
    telefono: string;       // Teléfono
    email: string;          // Correo electrónico
    rol: string;           // Rol del usuario
    estado: "Activo" | "Inactivo";
};

/** ====== Datos realistas (30 ítems) ====== */
const MOCK: Row[] = [
    { id: 1, documento: "CC", numeroDocumento: "1021805280", nombre: "Joaica Estad Grita Cuello", telefono: "30082328274", email: "joaicestd@gmail.com", rol: "Administrador", estado: "Inactivo" },
    { id: 2, documento: "PPT", numeroDocumento: "1221006289", nombre: "Samuel Condesa", telefono: "3113286848", email: "sam16208@gmail.com", rol: "Citrate", estado: "Activo" },
    { id: 3, documento: "CC", numeroDocumento: "1221302283", nombre: "Denier Alvarez", telefono: "3016245207", email: "negatiedi@gmail.com", rol: "Nexino", estado: "Activo" },
    { id: 4, documento: "CC", numeroDocumento: "1023456789", nombre: "María Fernanda Ríos", telefono: "3201234567", email: "maria.rios@email.com", rol: "Administrador", estado: "Activo" },
    { id: 5, documento: "PPT", numeroDocumento: "1234567890", nombre: "Juan Pablo Cabal", telefono: "3109876543", email: "juan.cabal@email.com", rol: "Usuario", estado: "Activo" },
    { id: 6, documento: "CC", numeroDocumento: "1122334455", nombre: "Sofía Valencia", telefono: "3001122334", email: "sofia.valencia@email.com", rol: "Editor", estado: "Inactivo" },
    { id: 7, documento: "CC", numeroDocumento: "9988776655", nombre: "Carlos Ariza", telefono: "3112233445", email: "carlos.ariza@email.com", rol: "Administrador", estado: "Activo" },
    { id: 8, documento: "PPT", numeroDocumento: "4455667788", nombre: "Daniel Castaño", telefono: "3223344556", email: "daniel.castano@email.com", rol: "Usuario", estado: "Inactivo" },
    { id: 9, documento: "CC", numeroDocumento: "7788990011", nombre: "Ana Lucía Torres", telefono: "3004455667", email: "ana.torres@email.com", rol: "Editor", estado: "Activo" },
    { id: 10, documento: "CC", numeroDocumento: "2233445566", nombre: "Hernán Bustos", telefono: "3155566778", email: "hernan.bustos@email.com", rol: "Usuario", estado: "Activo" },
    { id: 11, documento: "PPT", numeroDocumento: "6677889900", nombre: "Laura Ramírez", telefono: "3016677889", email: "laura.ramirez@email.com", rol: "Editor", estado: "Activo" },
    { id: 12, documento: "CC", numeroDocumento: "3344556677", nombre: "Camilo Pérez", telefono: "3207788990", email: "camilo.perez@email.com", rol: "Usuario", estado: "Inactivo" },
    { id: 13, documento: "CC", numeroDocumento: "5566778899", nombre: "Daniela Hoyos", telefono: "3118899001", email: "daniela.hoyos@email.com", rol: "Administrador", estado: "Activo" },
    { id: 14, documento: "PPT", numeroDocumento: "9900112233", nombre: "Andrés Ospina", telefono: "3009900112", email: "andres.ospina@email.com", rol: "Editor", estado: "Activo" },
    { id: 15, documento: "CC", numeroDocumento: "1122334455", nombre: "Carolina Vélez", telefono: "3220011223", email: "carolina.velez@email.com", rol: "Usuario", estado: "Inactivo" },
    { id: 16, documento: "CC", numeroDocumento: "3344556677", nombre: "Mateo Ballesteros", telefono: "3101122334", email: "mateo.ballesteros@email.com", rol: "Administrador", estado: "Activo" },
    { id: 17, documento: "PPT", numeroDocumento: "5566778899", nombre: "Juliana Patiño", telefono: "3012233445", email: "juliana.patino@email.com", rol: "Editor", estado: "Inactivo" },
    { id: 18, documento: "CC", numeroDocumento: "7788990011", nombre: "Felipe Moncada", telefono: "3203344556", email: "felipe.moncada@email.com", rol: "Usuario", estado: "Activo" },
    { id: 19, documento: "CC", numeroDocumento: "9900112233", nombre: "Valeria Ocampo", telefono: "3114455667", email: "valeria.ocampo@email.com", rol: "Administrador", estado: "Activo" },
    { id: 20, documento: "PPT", numeroDocumento: "1122334455", nombre: "Luis Eduardo Mora", telefono: "3005566778", email: "luis.mora@email.com", rol: "Editor", estado: "Activo" },
    { id: 21, documento: "CC", numeroDocumento: "3344556677", nombre: "Natalia Pineda", telefono: "3226677889", email: "natalia.pineda@email.com", rol: "Usuario", estado: "Inactivo" },
    { id: 22, documento: "CC", numeroDocumento: "5566778899", nombre: "Óscar Restrepo", telefono: "3107788990", email: "oscar.restrepo@email.com", rol: "Administrador", estado: "Activo" },
    { id: 23, documento: "PPT", numeroDocumento: "7788990011", nombre: "Camila Bernal", telefono: "3018899001", email: "camila.bernal@email.com", rol: "Editor", estado: "Activo" },
    { id: 24, documento: "CC", numeroDocumento: "9900112233", nombre: "Juanita Gómez", telefono: "3209900112", email: "juanita.gomez@email.com", rol: "Usuario", estado: "Inactivo" },
    { id: 25, documento: "CC", numeroDocumento: "1122334455", nombre: "Miguel Ángel Rincón", telefono: "3110011223", email: "miguel.rincon@email.com", rol: "Administrador", estado: "Activo" },
    { id: 26, documento: "PPT", numeroDocumento: "3344556677", nombre: "Esteban Salazar", telefono: "3001122334", email: "esteban.salazar@email.com", rol: "Editor", estado: "Inactivo" },
    { id: 27, documento: "CC", numeroDocumento: "5566778899", nombre: "Paula Cruz", telefono: "3222233445", email: "paula.cruz@email.com", rol: "Usuario", estado: "Activo" },
    { id: 28, documento: "CC", numeroDocumento: "7788990011", nombre: "Andrés Felipe Rueda", telefono: "3103344556", email: "andres.rueda@email.com", rol: "Administrador", estado: "Activo" },
    { id: 29, documento: "PPT", numeroDocumento: "9900112233", nombre: "Diana Quintero", telefono: "3014455667", email: "diana.quintero@email.com", rol: "Editor", estado: "Activo" },
    { id: 30, documento: "CC", numeroDocumento: "1122334455", nombre: "Tomás Cárdenas", telefono: "3205566778", email: "tomas.cardenas@email.com", rol: "Usuario", estado: "Inactivo" },
];

export default function UsersPage() {
    const [users, setUsers] = useState<Row[]>(MOCK);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleCreateUser = (userData: any) => {
        const newUser: Row = {
            id: users.length + 1,
            documento: userData.tipoDocumento,
            numeroDocumento: userData.documento,
            nombre: `${userData.nombre} ${userData.apellido}`,
            telefono: userData.telefono,
            email: userData.email,
            rol: "Usuario",
            estado: "Activo",
        };

        setUsers((prev) => [...prev, newUser]);
        setIsCreateModalOpen(false);
    };

    const handleView = (row: Row) => {
        console.log("Ver usuario:", row);
        // Aquí puedes implementar la lógica para ver el usuario
    };

    const handleEdit = (row: Row) => {
        console.log("Editar usuario:", row);
        // Aquí puedes implementar la lógica para editar el usuario
    };

    const handleDelete = (row: Row) => {
        console.log("Eliminar usuario:", row);
        // Aquí puedes implementar la lógica para eliminar el usuario
    };

    // Definición de columnas para el DataTable
    const columns: Column<Row>[] = [
        { key: "id", header: "#" },
        { key: "documento", header: "T. Documento" },
        { key: "numeroDocumento", header: "Número" },
        { key: "nombre", header: "Nombre" },
        { key: "telefono", header: "Teléfono" },
        { key: "email", header: "Correo electrónico" },
        { key: "rol", header: "Rol" },
        { 
            key: "estado", 
            header: "Estado",
            render: (row) => (
                <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                        color: row.estado === "Activo" ? Colors.states.success : Colors.states.inactive
                    }}
                >
                    {row.estado}
                </span>
            )
        },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Toast Container para mostrar notificaciones */}
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            {/* AsideNav */}
            <AsideNav />

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col">
                {/* TopNav */}
                <TopNav />

                {/* Contenido */}
                <main className="flex-1 flex flex-col" style={{ backgroundColor: "#E8E8E8" }}>
                    <div className="px-6 pt-6">
                        <CreateUserModal
                            isOpen={isCreateModalOpen}
                            onClose={() => setIsCreateModalOpen(false)}
                            onSave={handleCreateUser}
                        />

                        {/* DataTable genérico */}
                        <DataTable<Row>
                            data={users}
                            columns={columns}
                            pageSize={10}
                            searchableKeys={["nombre", "email", "rol", "documento", "numeroDocumento", "telefono", "estado"]}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onCreate={() => setIsCreateModalOpen(true)}
                            searchPlaceholder="Buscar por nombre, email, rol, documento, teléfono o estado…"
                            createButtonText="Crear Usuario"
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}