const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6 text-center md:text-left">
        {/* Columna 1 */}
        <div>
          <h3 className="text-white font-bold text-lg mb-2">SISTEMAS PC</h3>
          <p className="text-sm">
            Tu aliado tecnológico de confianza. Innovación y soluciones que
            impulsan tu negocio.
          </p>
        </div>

        {/* Columna 2 */}
        <div>
          <h4 className="text-white font-semibold mb-2">Enlaces</h4>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="/services">Servicios</a>
            </li>
            <li>
              <a href="/products">Productos</a>
            </li>
            <li>
              <a href="/about">Nosotros</a>
            </li>
            <li>
              <a href="/contact">Contáctanos</a>
            </li>
          </ul>
        </div>

        {/* Columna 3 */}
        <div>
          <h4 className="text-white font-semibold mb-2">Contacto</h4>
          <p className="text-sm">📍 Medellín, Colombia</p>
          <p className="text-sm">📞 +57 300 123 4567</p>
          <p className="text-sm">📧 contacto@sistemasp.com</p>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm mt-6 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} SISTEMAS PC — Todos los derechos reservados
      </div>
    </footer>
  );
};

export default Footer;
