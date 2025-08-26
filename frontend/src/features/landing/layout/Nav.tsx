"use client";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-amber-700 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-red-600 font-bold text-xl">
          SISTEMAS PC
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 text-gray-800 font-medium">
          <Link href="/services">Servicios</Link>
          <Link href="/products">Productos</Link>
          <Link href="/about">Nosotros</Link>
          <Link href="/contact">Contáctanos</Link>
          <Link href="/login">Iniciar Sesión</Link>
          <Link href="/cart" className="flex items-center">
            <ShoppingCart className="h-5 w-5 text-red-600" />
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
        <div className="md:hidden flex flex-col bg-white shadow-md px-4 pb-4 space-y-2">
          <Link href="/services">Servicios</Link>
          <Link href="/products">Productos</Link>
          <Link href="/about">Nosotros</Link>
          <Link href="/contact">Contáctanos</Link>
          <Link href="/login">Iniciar Sesión</Link>
          <Link href="/cart" className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-red-600" /> Carrito
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Nav;
