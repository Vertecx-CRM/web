"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Menu, X } from "lucide-react";
import { routes } from "@/shared/routes";
import CartModal from "../components/CartModal";

const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const links = [
    { href: routes.landing.services, label: "Servicios" },
    { href: routes.landing.products, label: "Productos" },
    { href: routes.landing.about, label: "Nosotros" },
    { href: routes.landing.contact, label: "Contáctanos" },
    { href: routes.auth.access, label: "Acceder" },
  ];

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            href={routes.path}
            className="relative flex items-center overflow-hidden group rounded-md"
          >
            <Image
              src="/assets/imgs/logo.png"
              alt="logo"
              width={180}
              height={50}
              priority
              className="relative z-10 cursor-pointer transition duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-gray-900 font-semibold text-lg">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="relative group">
                <span className="relative z-10">{link.label}</span>
                {/* underline animado */}
                <span className="absolute left-0 -bottom-1 h-[3px] w-full origin-left scale-x-0 bg-red-700 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}

            {/* Carrito Desktop */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative cursor-pointer ml-4 text-black px-4 py-1 rounded-md flex items-center justify-center overflow-hidden group transition-colors duration-300"
              aria-label="Abrir carrito"
            >
              <span className="absolute inset-0 bg-red-800 scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
              <ShoppingCart className="h-7 w-7 relative z-10 transition-colors duration-300 group-hover:text-white" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menú móvil"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-8 w-8" />
            ) : (
              <Menu className="h-8 w-8" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden bg-white px-6 py-5 flex flex-col gap-5 shadow-md transform transition-all duration-300 ${
            isMenuOpen
              ? "max-h-[600px] opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-lg font-medium text-gray-800 hover:text-red-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Carrito en móvil */}
          <button
            onClick={() => {
              setIsCartOpen(true);
              setIsMenuOpen(false);
            }}
            className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md flex items-center justify-center transition"
          >
            <ShoppingCart className="h-5 w-5 mr-2" /> Carrito
          </button>
        </div>
      </nav>

      {/* Modal del carrito */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Nav;
