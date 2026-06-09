"use client";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    
    {
      label: "Instagram",
      href: "#",
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: "#",
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    
  ];

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 px-6 sm:px-10 lg:px-20 text-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-20">
          {/* Columna 1: Branding */}
          <div className="space-y-6">
            <Image
              src="/assets/imgs/logo.png"
              alt="Sistemas PC"
              width={140}
              height={70}
              className="grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer"
            />
            <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] font-light">
              Expertos en ingeniería y soluciones tecnológicas a medida.
              Transformamos infraestructura con precisión desde 2004.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-1 bg-red-600"></div>
              <div className="w-4 h-1 bg-black"></div>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600"></span> Compañía
            </h4>
            <ul className="space-y-4">
              {[
                { href: "/services", label: "Servicios Especializados" },
                { href: "/products", label: "Catálogo de Productos" },
                { href: "/about", label: "Sobre Nosotros" },
                { href: "/contact", label: "Centro de Soporte" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-red-600 text-sm transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-4 h-[1px] bg-red-600 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Redes Sociales (Con Iconos) */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600"></span> Conecta con nosotros
            </h4>
            <div className="flex gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-gray-400 hover:text-red-600 transform hover:-translate-y-1 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <p className="mt-8 text-xs text-gray-400 font-medium uppercase tracking-widest">
              Síguenos para ver <br /> nuestros últimos proyectos
            </p>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            © {currentYear} <span className="text-black">Sistemas PC</span> —
            All Rights Reserved.
          </div>

          <div className="flex gap-8">
            {[
              { href: "#", label: "Privacidad" },
              { href: "#", label: "Términos" },
              { href: "#", label: "Cookies" },
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
