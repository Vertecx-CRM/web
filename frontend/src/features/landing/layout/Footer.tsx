"use client";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 mt-12 border-t border-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-8 text-center md:text-left">
        {/* Columna 1: Derechos de autor */}
        <div className="flex flex-col items-center md:items-start">
          <p className="mt-4 text-xs text-red-600">
            © {new Date().getFullYear()} SISTEMAS PC. <br />
            Todos los derechos reservados
          </p>
        </div>

        {/* Columna 2: Logo y descripción */}
        <div className="flex flex-col items-center md:items-start">
          <Image
            src="/assets/imgs/logo.png"
            alt="Sistemas PC"
            width={120}
            height={60}
            priority
          />
          <p className="mt-3 text-sm text-gray-600 max-w-[200px]">
            Expertos en desarrollo y soluciones a medida.
          </p>
        </div>

        {/* Columna 3: Compañía */}
        <div>
          <h4 className="text-red-700 font-semibold mb-3 uppercase">
            Compañía
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/services">Servicios</Link>
            </li>
            <li>
              <Link href="/products">Productos</Link>
            </li>
            <li>
              <Link href="/about">Quienes Somos</Link>
            </li>
          </ul>
        </div>

        {/* Columna 4: Redes Sociales */}
        <div>
          <h4 className="text-red-700 font-semibold mb-3 uppercase">
            Redes Sociales
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#">Instagram</a>
            </li>
            <li>
              <a href="#">Facebook</a>
            </li>
          </ul>
        </div>

        {/* Columna vacía para simetría */}
        <div></div>
      </div>

      {/* Línea divisoria y links inferiores */}
      <div className=" mt-2">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-end gap-16 text-sm text-gray-500">
          <Link href="#">Políticas de Privacidad</Link>
          <Link href="#">Términos de Uso</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
