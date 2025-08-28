"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { routes } from "@/shared/routes";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Image
          src="/assets/imgs/logo.png"
          alt="logo"
          width={120}
          height={60}
          priority
        />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-gray-900 font-semibold text-base">
          <Link href={routes.landing.services}>Servicios</Link>
          <Link href={routes.landing.products}>Productos</Link>
          <Link href={routes.landing.about}>Nosotros</Link>
          <Link href={routes.landing.contact}>Contáctanos</Link>
          <Link href={routes.auth.login}>Iniciar Sesión</Link>

          {/* Carrito */}
          <Link
            href={routes.landing.cart}
            className="ml-4 bg-red-700 hover:bg-red-800 text-white px-4 py-1 rounded-md flex items-center justify-center transition"
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col bg-white shadow-md px-6 pb-4 space-y-3 text-gray-900 font-medium">
          <Link href={routes.landing.services}>Servicios</Link>
          <Link href={routes.landing.products}>Productos</Link>
          <Link href={routes.landing.about}>Nosotros</Link>
          <Link href={routes.landing.contact}>Contáctanos</Link>
          <Link href={routes.auth.login}>Iniciar Sesión</Link>
          <Link
            href={routes.landing.cart}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md transition"
          >
            <ShoppingCart className="h-5 w-5" /> Carrito
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Nav;
