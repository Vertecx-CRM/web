"use client";

import Colors from "@/shared/theme/colors";
import { useMemo, useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CreateCategoryModal } from "./components/CreateCategoryProduct";

/** ====== Tipos ====== */
type Row = {
    id: number;
    nombre: string;
    descripcion: string;
    estado: "Activo" | "Inactivo";
};

/** ====== Datos realistas (30 ítems) ====== */
const MOCK: Row[] = [
    { id: 1, nombre: "Electrónicos", descripcion: "Dispositivos electrónicos y gadgets", estado: "Activo" },
    { id: 2, nombre: "Ropa", descripcion: "Prendas de vestir para todas las edades", estado: "Activo" },
    { id: 3, nombre: "Hogar", descripcion: "Artículos para el hogar y decoración", estado: "Inactivo" },
    { id: 4, nombre: "Deportes", descripcion: "Equipamiento y ropa deportiva", estado: "Activo" },
    { id: 5, nombre: "Juguetes", descripcion: "Juguetes para niños y niñas", estado: "Activo" },
    { id: 6, nombre: "Libros", descripcion: "Libros de todos los géneros", estado: "Activo" },
    { id: 7, nombre: "Belleza", descripcion: "Productos de cuidado personal y belleza", estado: "Inactivo" },
    { id: 8, nombre: "Alimentos", descripcion: "Productos alimenticios y bebidas", estado: "Activo" },
    { id: 9, nombre: "Muebles", descripcion: "Muebles para interior y exterior", estado: "Activo" },
    { id: 10, nombre: "Jardín", descripcion: "Herramientas y plantas para jardín", estado: "Activo" },
    { id: 11, nombre: "Tecnología", descripcion: "Dispositivos tecnológicos y accesorios", estado: "Activo" },
    { id: 12, nombre: "Salud", descripcion: "Productos para el cuidado de la salud", estado: "Inactivo" },
    { id: 13, nombre: "Automóviles", descripcion: "Accesorios y repuestos para autos", estado: "Activo" },
    { id: 14, nombre: "Instrumentos", descripcion: "Instrumentos musicales y accesorios", estado: "Activo" },
    { id: 15, nombre: "Oficina", descripcion: "Suministros y muebles de oficina", estado: "Activo" },
    { id: 16, nombre: "Bebés", descripcion: "Productos para bebés y niños pequeños", estado: "Inactivo" },
    { id: 17, nombre: "Mascotas", descripcion: "Alimentos y accesorios para mascotas", estado: "Activo" },
    { id: 18, nombre: "Viajes", descripcion: "Equipaje y accesorios de viaje", estado: "Activo" },
    { id: 19, nombre: "Joyeria", descripcion: "Joyas y accesorios personales", estado: "Activo" },
    { id: 20, nombre: "Herramientas", descripcion: "Herramientas manuales y eléctricas", estado: "Inactivo" },
    { id: 21, nombre: "Arte", descripcion: "Materiales y suministros de arte", estado: "Activo" },
    { id: 22, nombre: "Videojuegos", descripcion: "Consolas y videojuegos", estado: "Activo" },
    { id: 23, nombre: "Fotografía", descripcion: "Cámaras y equipos de fotografía", estado: "Activo" },
    { id: 24, nombre: "Relojes", descripcion: "Relojes de pulsera y de pared", estado: "Inactivo" },
    { id: 25, nombre: "Calzado", descripcion: "Zapatos y calzado para toda ocasión", estado: "Activo" },
    { id: 26, nombre: "Outdoor", descripcion: "Equipamiento para actividades al aire libre", estado: "Activo" },
    { id: 27, nombre: "Limpieza", descripcion: "Productos de limpieza para el hogar", estado: "Activo" },
    { id: 28, nombre: "Electrodomésticos", descripcion: "Electrodomésticos grandes y pequeños", estado: "Inactivo" },
    { id: 29, nombre: "Navidad", descripcion: "Decoraciones y artículos navideños", estado: "Activo" },
    { id: 30, nombre: "Coleccionables", descripcion: "Artículos de colección y antigüedades", estado: "Activo" },
];

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Row[]>(MOCK);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const handleCreateCategory = (categoryData: any) => {
        const newCategory: Row = {
            id: categories.length + 1, // genera ID simple
            nombre: categoryData.nombre,
            descripcion: categoryData.descripcion,
            estado: "Activo", // valor inicial
        };

        setCategories((prev) => [...prev, newCategory]);
        setIsCreateModalOpen(false);
    };

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return categories;
        return categories.filter(
            r =>
                r.nombre.toLowerCase().includes(term) ||
                r.descripcion.toLowerCase().includes(term)
        );
    }, [q, categories]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const current = filtered.slice((page - 1) * pageSize, page * pageSize);
    const goTo = (p: number) => setPage(Math.min(Math.max(p, 1), totalPages));

    return (
        <div className="min-h-screen flex">
            {/* Sidebar (color exacto pedido) */}
            <aside className="w-64 h-screen text-white flex-shrink-0" style={{ backgroundColor: "#B20000" }}>
                <div className="px-4 py-6 font-semibold">
                    Dashboard <br /> Administrador
                </div>
                <nav className="text-sm divide-y divide-white/10">
                    {["Dashboard", "Acceso", "Productos", "Servicios", "Clientes", "Configuración"].map((item, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-white/10 cursor-pointer">
                            {item}
                        </div>
                    ))}
                </nav>
            </aside>

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
                
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
                    <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
                        <h1 className="text-3xl font-extrabold tracking-tight text-red-700">Categorías de Productos</h1>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>Joao Estid Ortiz Cuello</span>
                            <div className="h-8 w-8 rounded-full bg-gray-200" />
                        </div>
                    </div>
                </header>

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
                            Crear Categoría
                        </button>
                    </div>
                    <CreateCategoryModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onSave={handleCreateCategory}
                    />

                    <div className="overflow-hidden rounded-xl bg-white shadow-sm flex flex-col">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10" style={{ backgroundColor: Colors.table.header }}>
                                <tr className="text-left">
                                    <Th>ID</Th>
                                    <Th>Nombre</Th>
                                    <Th>Descripción</Th>
                                    <Th>Estado</Th>
                                    <Th>Acciones</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E6E6E6]">
                                {current.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50" >
                                        <Td>{r.id}</Td>
                                        <Td>{r.nombre}</Td>
                                        <Td>{r.descripcion}</Td>
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
                                        <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Sin resultados.</td>
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