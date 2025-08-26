"use client";
import Link from "next/link";

function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" d="M3 3h2l2 12h10l2-8H6" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </svg>
  );
}

export default function PublicNavbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SistemasPc" className="h-6" />
          <span className="font-bold text-red-600">SistemasPc</span>
        </div>

        <div className="hidden md:flex gap-6">
          <Link href="/services" className="hover:text-red-600">Servicios</Link>
          <Link href="/products" className="hover:text-red-600">Productos</Link>
          <Link href="/about" className="hover:text-red-600">Nosotros</Link>
          <Link href="/contact" className="hover:text-red-600">Contáctanos</Link>
          <Link href="/auth/login" className="text-red-600 font-semibold">Iniciar Sesión</Link>
        </div>

        <button className="border rounded-full p-2 hover:bg-gray-100" aria-label="Carrito">
          <CartIcon className="h-5 w-5 text-red-600" />
        </button>
      </div>
    </nav>
  );
}
