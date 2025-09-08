"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { routes } from "@/shared/routes";
import CartModal from "../components/CartModal";

const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href={routes.path} className="flex items-center">
            <Image
              src="/assets/imgs/logo.png"
              alt="logo"
              width={120}
              height={60}
              priority
              className="cursor-pointer"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-gray-900 font-semibold text-base">
            <Link href={routes.landing.services}>Servicios</Link>
            <Link href={routes.landing.products}>Productos</Link>
            <Link href={routes.landing.about}>Nosotros</Link>
            <Link href={routes.landing.contact}>Contáctanos</Link>
            <Link href={routes.auth.login}>Iniciar Sesión</Link>
            <Link href={routes.auth.register}>Registrarse</Link>

            {/* Carrito */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="ml-4 bg-red-700 hover:bg-red-800 text-white px-4 py-1 rounded-md flex items-center justify-center transition"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu desplegable */}
        {isMenuOpen && (
          <div className="md:hidden bg-white px-6 py-4 flex flex-col gap-4 shadow-md">
            <Link href={routes.landing.services}>Servicios</Link>
            <Link href={routes.landing.products}>Productos</Link>
            <Link href={routes.landing.about}>Nosotros</Link>
            <Link href={routes.landing.contact}>Contáctanos</Link>
            <Link href={routes.auth.login}>Iniciar Sesión</Link>

            {/* Carrito en móvil */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md flex items-center justify-center transition"
            >
              <ShoppingCart className="h-5 w-5 mr-2" /> Carrito
            </button>
          </div>
        )}
      </nav>

      {/* Modal del carrito */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Nav;
