import React from 'react';

export const Filtro = () => {
  return (
    <div className="w-[300px] bg-white rounded-2xl shadow-md p-4 flex flex-col justify-center">
      {/* Todas las citas */}
      <div className="flex items-center mb-4">
        <div className="w-6 h-6 mr-2 flex items-center justify-center bg-[#F4F4F4] rounded-full">
          <img
            src="/icons/keyboard_arrow_down.svg"
            alt="Indicador todas las citas"
            className="w-4 h-4 object-contain"
          />
        </div>
        <div className="flex items-center">
          <div className="text-black text-sm font-medium">Todas las citas</div>
        </div>
      </div>

      {/* Mantenimiento */}
      <div className="flex items-center mb-4">
        <div className="w-6 h-6 mr-2 flex items-center justify-center bg-[#F4F4F4] rounded-full">
          <img
            src="/icons/keyboard_arrow_down.svg"
            alt="Indicador mantenimiento"
            className="w-4 h-4 object-contain"
          />
        </div>
        <div className="flex items-center">
          <div className="text-black text-sm font-medium">Mantenimiento</div>
        </div>
      </div>

      {/* Instalación */}
      <div className="flex items-center">
        <div className="w-6 h-6 mr-2 flex items-center justify-center bg-[#F4F4F4] rounded-full">
          <img
            src="/icons/keyboard_arrow_down.svg"
            alt="Indicador instalación"
            className="w-4 h-4 object-contain"
          />
        </div>
        <div className="flex items-center">
          <div className="text-black text-sm font-medium">Instalación</div>
        </div>
      </div>
    </div>
  );
};