"use client";

import Image from "next/image";
import Link from "next/link";
import { routes } from "@/shared/routes";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 px-6 sm:px-10 lg:px-20 text-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-20">
          <div className="space-y-6">
            <Image
              src="/assets/imgs/logo.png"
              alt="Vertecx Sistemas PC"
              width={140}
              height={70}
              className="grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer"
            />
            <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] font-light">
              Expertos en ingenieria y soluciones tecnologicas a medida.
              Transformamos infraestructura con precision desde 2004.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-1 bg-red-600" />
              <div className="w-4 h-1 bg-black" />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600" /> Compania
            </h4>
            <ul className="space-y-4">
              {[
                {
                  href: routes.landing.services,
                  label: "Servicios especializados",
                },
                {
                  href: routes.landing.products,
                  label: "Catalogo de productos",
                },
                { href: routes.landing.about, label: "Sobre nosotros" },
                { href: routes.landing.contact, label: "Centro de soporte" },
                {
                  href: "/landing/soluciones/soporte-tecnico-empresarial-colombia",
                  label: "Soporte tecnico empresarial",
                },
                {
                  href: "/landing/soluciones/mantenimiento-computadores-empresas",
                  label: "Mantenimiento computadores",
                },
                {
                  href: "/landing/soluciones/redes-servidores-empresas",
                  label: "Redes y servidores",
                },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-red-600 text-sm transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-4 h-[1px] bg-red-600 transition-all duration-300 mr-0 group-hover:mr-2" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600" /> Conecta con nosotros
            </h4>
            <div className="flex gap-6">
              <a
                href="https://www.instagram.com/sistemas.pc/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Sistemas PC"
                className="text-gray-400 hover:text-red-600 transform hover:-translate-y-1 transition-all duration-300"
              >
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
            <p className="mt-8 text-xs text-gray-400 font-medium uppercase tracking-widest">
              Siguenos para ver <br /> nuestros ultimos proyectos
            </p>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {currentYear} <span className="text-black">Vertecx Sistemas PC</span>
            {" - "}All Rights Reserved.
          </div>

          <div className="flex gap-8">
            {[
              { href: routes.landing.services, label: "Servicios" },
              { href: routes.landing.products, label: "Productos" },
              { href: routes.landing.contact, label: "Contacto" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-red-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
