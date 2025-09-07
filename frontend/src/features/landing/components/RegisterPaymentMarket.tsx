import React from "react";
import { X } from "lucide-react";
import Image from "next/image";
import Nav from "../layout/Nav";
import Colors from "@/shared/theme/colors";

const RegisterPaymentMarket = () => {
  return (
    <>
      <Nav />
      <div className="fixed inset-0 flex items-center justify-center p-4 rounded">
        {/* Card principal */}
        <div className="bg-white rounded-lg shadow-lg w-full max-w-sm relative">
          {/* Botón cerrar */}
          <button className="cursor-pointer absolute top-3 right-3 text-gray-600 hover:text-black">
            <X size={22} />
          </button>

          {/* Logo */}
          <Image
            className="mx-auto"
            src="/assets/imgs/mercadoPagoLogo.png"
            alt="Mercado Pago"
            width={120}
            height={60}
            priority
          />

          {/* Título */}
          <h2 className="text-xl font-semibold text-center mt-4 mb-6">
            Regístrate
          </h2>

          {/* Formulario */}
          <form className="px-6 pb-6 space-y-4">
            <input
              type="text"
              placeholder="Nombre"
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-red-400 focus:border-red-400 outline-none"
            />
            <input
              type="text"
              placeholder="Fecha de nacimiento"
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-red-400 focus:border-red-400 outline-none"
            />

            <div className="flex gap-3">
              <select className="w-1/2 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-red-400 focus:border-red-400 outline-none">
                <option>DNI</option>
                <option>Cédula</option>
                <option>Pasaporte</option>
              </select>
              <select className="w-1/2 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-red-400 focus:border-red-400 outline-none">
                <option>Personal</option>
                <option>Empresa</option>
              </select>
            </div>

            <input
              type="email"
              placeholder="E-mail"
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-red-400 focus:border-red-400 outline-none"
            />

            <input
              type="password"
              placeholder="Contraseña"
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-red-400 focus:border-red-400 outline-none"
            />

            {/* Checkbox */}
            <label className="flex items-center text-sm gap-2">
              <input type="checkbox" className="accent-blue-600" />
              <span>
                Acepto los{" "}
                <a href="#" className="text-blue-600 underline">
                  Términos y Condiciones
                </a>
              </span>
            </label>

            {/* Botón principal */}
            <button
              type="submit"
              style={{backgroundColor: Colors.buttons.primary}}
              className="cursor-pointer w-full  hover:bg-red-700 text-white py-2 rounded-md font-medium transition-colors"
            >
              Registrarme
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterPaymentMarket;
