"use client";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCategories } from './hooks/useCategories';
import CategoriesTable from './components/CategoriesTable';
import CreateCategoryModal from './components/CreateCategoryModal';

export default function CategoriesPage() {
  const {
    categories,
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleCreateCategory,
    handleView,
    handleEdit,
    handleDelete
  } = useCategories();

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
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Contenido */}
        <main className="flex-1 flex flex-col" style={{ backgroundColor: "#E8E8E8" }}>
          {/* Tools + Tabla */}
          <div className="flex-1 px-6 py-6">
            <CreateCategoryModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreateCategory}
            />

            <CategoriesTable
              categories={categories}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={() => setIsCreateModalOpen(true)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}