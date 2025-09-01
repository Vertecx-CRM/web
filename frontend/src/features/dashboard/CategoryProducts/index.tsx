"use client";

import Colors from "@/shared/theme/colors";
import { useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CreateCategoryModal } from "./components/CreateCategoryProduct";
import AsideNav from "../layout/AsideNav";
import TopNav from "../layout/TopNav";
import { DataTable, Column } from "../components/DataTable";

/** ====== Tipos ====== */
type Row = {
  id: number;
  nombre: string;
  descripcion: string;
  estado: "Activo" | "Inactivo";
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
  { id: 25, nombre: "Calzado", descripcion: "Zapatos and calzado para toda ocasión", estado: "Activo" },
  { id: 26, nombre: "Outdoor", descripcion: "Equipamiento para actividades al aire libre", estado: "Activo" },
  { id: 27, nombre: "Limpieza", descripcion: "Productos de limpieza para el hogar", estado: "Activo" },
  { id: 28, nombre: "Electrodomésticos", descripcion: "Electrodomésticos grandes y pequeños", estado: "Inactivo" },
  { id: 29, nombre: "Navidad", descripcion: "Decoraciones y artículos navideños", estado: "Activo" },
  { id: 30, nombre: "Coleccionables", descripcion: "Artículos de colección y antigüedades", estado: "Activo" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Row[]>(MOCK);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateCategory = (categoryData: any) => {
    const newCategory: Row = {
      id: categories.length + 1, // genera ID simple
      nombre: categoryData.nombre,
      descripcion: categoryData.descripcion,
      estado: "Activo", // valor inicial
    };
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
    setCategories((prev) => [...prev, newCategory]);
    setIsCreateModalOpen(false);
  };

  // Definición de columnas para el DataTable - TIPADO CORRECTO
  const columns: Column<Row>[] = [
    { key: "id", header: "ID" },
    { key: "nombre", header: "Nombre" },
    { key: "descripcion", header: "Descripción" },
    { 
      key: "estado", 
      header: "Estado",
      render: (row: Row) => (
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
        <main className="flex-1 flex flex-col bg-gray-100" style={{ backgroundColor: "#E8E8E8" }}>
          {/* Tools + Tabla */}
          <div className="flex-1 px-6 py-6">
            <CreateCategoryModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreateCategory}
            />

            <DataTable<Row>
              data={categories}
              columns={columns}
              pageSize={10}
              searchableKeys={["id", "nombre", "descripcion", "estado"]}
              onCreate={() => setIsCreateModalOpen(true)}
              createButtonText="Crear Categoría"
              searchPlaceholder="Buscar categorías..."
              onView={(row) => console.log("Ver", row)}
              onEdit={(row) => console.log("Editar", row)}
              onDelete={(row) => console.log("Eliminar", row)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
