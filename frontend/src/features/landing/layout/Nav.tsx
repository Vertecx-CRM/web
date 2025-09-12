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
      <nav className="bg-white shadow-md h-30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            href={routes.path}
            className="relative flex items-center overflow-hidden group rounded-md"
          >
            {/* Fondo animado */}
            <span className="absolute inset-0 bg-red-800 scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100"></span>

            {/* Logo */}
            <Image
              src="/assets/imgs/logo.png"
              alt="logo"
              width={220}
              height={60}
              priority
              className="relative z-10 cursor-pointer transition duration-300 group-hover:brightness-0 group-hover:invert"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden text-2xl md:flex items-center gap-8 text-gray-900 font-semibold">
            {[
              { href: routes.landing.services, label: "Servicios" },
              { href: routes.landing.products, label: "Productos" },
              { href: routes.landing.about, label: "Nosotros" },
              { href: routes.landing.contact, label: "Contáctanos" },
              { href: routes.auth.login, label: "Iniciar Sesión" },
              { href: routes.auth.register, label: "Registrarse" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="relative group">
                <span className="relative z-10">{link.label}</span>
                {/* underline animado */}
                <span className="absolute left-0 -bottom-1 h-[4px] w-full origin-left scale-x-0 bg-red-700 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
            {/* Carrito */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative cursor-pointer ml-4 text-black px-4 py-1 rounded-md flex items-center justify-center overflow-hidden group transition-colors duration-300"
            >
              {/* Fondo animado */}
              <span className="absolute inset-0 bg-red-800 scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100"></span>

              {/* Icono */}
              <ShoppingCart className="h-9 w-9 relative z-10 transition-colors duration-300 group-hover:text-white" />
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
          <div className="md:hidden  bg-white px-6 py-5  flex flex-col gap-4 shadow-md">
            <Link href={routes.landing.services}>Servicios</Link>
            <Link href={routes.landing.products}>Productos</Link>
            <Link href={routes.landing.about}>Nosotros</Link>
            <Link href={routes.landing.contact}>Contáctanos</Link>
            <Link href={routes.auth.login}>Iniciar Sesión</Link>

            {/* Carrito en móvil */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md flex items-center justify-center transition"
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
