"use client";

import Colors from "@/shared/theme/colors";
import { useMemo, useState } from "react";
import CreateUserModal from "./components/createUser";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

/** ====== Iconos (SVG minimal) ====== */
const PlusIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="2" d="M12 5v14M5 12h14" /></svg>);
const SearchIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" /></svg>);
const EyeIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" /><circle cx="12" cy="12" r="3" /></svg>);
const PenIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path d="M12 20h9" /><path d="M16.5 3.5l4 4L7 21l-4 1 1-4L16.5 3.5z" /></svg>);
const TrashIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>);

export default function UsersPage() {
    const [users, setUsers] = useState<Row[]>(MOCK);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const handleCreateUser = (userData: any) => {
        const newUser: Row = {
            id: users.length + 1, // genera ID simple
            documento: userData.tipoDocumento,
            numeroDocumento: userData.documento,
            nombre: `${userData.nombre} ${userData.apellido}`,
            telefono: userData.telefono,
            email: userData.email,
            rol: "Usuario", // puedes elegir si pedirlo en el form
            estado: "Activo", // valor inicial
        };

        setUsers((prev) => [...prev, newUser]);
        setIsCreateModalOpen(false);
    };

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return users;
        return users.filter(
            r =>
                r.nombre.toLowerCase().includes(term) ||
                r.email.toLowerCase().includes(term) ||
                r.rol.toLowerCase().includes(term) ||
                r.documento.toLowerCase().includes(term) ||
                r.numeroDocumento.toLowerCase().includes(term)
        );
    }, [q, users]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const current = filtered.slice((page - 1) * pageSize, page * pageSize);
    const goTo = (p: number) => setPage(Math.min(Math.max(p, 1), totalPages));

    return (
        <div className="min-h-screen flex">

            {/* Contenido */}
            <main className="flex-1 flex flex-col bg-gray-100" style={{ backgroundColor: "#E8E8E8" }}>
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
                


                {/* Tools + Tabla */}
                <div className="flex-1 px-6 py-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="relative w-full max-w-md">
                            <img
                                src="/icons/search.svg"
                                alt="Buscar"
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
                            />
                            <input
                                value={q}
                                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                                className="w-full rounded-full border-none bg-white px-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                            />
                        </div>

                        <button className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700" style={{ background: Colors.buttons.primary }} onClick={() => setIsCreateModalOpen(true)}>
                            <img src="/icons/Plus.svg" className="h-4 w-4" />
                            Crear Usuario
                        </button>
                    </div>
                    <CreateUserModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onSave={handleCreateUser}
                    />

                    <div className="overflow-hidden rounded-xl bg-white shadow-sm flex flex-col">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10" style={{ backgroundColor: Colors.table.header }}>
                                <tr className="text-left">
                                    <Th>#</Th>
                                    <Th>T. Documento</Th>
                                    <Th>Número</Th>
                                    <Th>Nombre</Th>
                                    <Th>Teléfono</Th>
                                    <Th>Correo electrónico</Th>
                                    <Th>Rol</Th>
                                    <Th>Estado</Th>
                                    <Th>Acciones</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E6E6E6]">
                                {current.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50" >
                                        <Td>{r.id}</Td>
                                        <Td>{r.documento}</Td>
                                        <Td>{r.numeroDocumento}</Td>
                                        <Td >{r.nombre}</Td>
                                        <Td>{r.telefono}</Td>
                                        <Td>{r.email}</Td>
                                        <Td>{r.rol}</Td>
                                        <Td>
                                            <span
                                                className="rounded-full px-2 py-0.5 text-xs font-medium"
                                                style={{
                                                    color: r.estado === "Activo" ? Colors.states.success : Colors.states.inactive
                                                }}
                                            >
                                                {r.estado}
                                            </span>
                                        </Td>
                                        <Td>
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <button className="hover:text-gray-900" title="Ver"><img src="/icons/Eye.svg" className="h-4 w-4" /></button>
                                                <button className="hover:text-gray-900" title="Editar"><img src="/icons/Edit.svg" className="h-4 w-4" /></button>
                                                <button className="hover:text-red-600" title="Eliminar"><img src="/icons/delete.svg" className="h-4 w-4" /></button>
                                            </div>
                                        </Td>
                                    </tr>
                                ))}

                                {current.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-10 text-center text-gray-500">Sin resultados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Paginación */}
                        <div className="border-t border-[#E6E6E6] bg-white px-3 py-2" >
                            <div className="flex items-center justify-center gap-1">
                                <PageBtn onClick={() => goTo(page - 1)} disabled={page === 1}>{"<"}</PageBtn>
                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const p = i + 1;
                                    const active = p === page;
                                    return (
                                        <PageBtn key={p} onClick={() => goTo(p)} active={active} aria-current={active ? "page" : undefined}>
                                            {p}
                                        </PageBtn>
                                    );
                                })}
                                <PageBtn onClick={() => goTo(page + 1)} disabled={page === totalPages}>{">"}</PageBtn>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

/** ====== Helpers UI ====== */
function Th({ children }: { children: React.ReactNode }) {
    return <th className="px-4 py-3 font-semibold">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
function PageBtn({
    children, onClick, disabled, active, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
    return (
        <button
            {...rest}
            onClick={onClick}
            disabled={disabled}
            style={{
                backgroundColor: active ? 'white' : Colors.table.header,
                borderColor: Colors.table.lines,
            }}
            className="min-w-8 rounded-md px-2 py-1 text-xs border text-black disabled:opacity-40 disabled:pointer-events-none transition-colors duration-200"
        >
            {children}
        </button>
    );
}