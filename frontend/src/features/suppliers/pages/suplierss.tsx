"use client";

import { useMemo, useState } from "react";

/** ====== Tipos ====== */
type Row = {
  id: number;
  name: string;      // Nombre del proveedor
  nit: string;       // NIT/RUC
  rating: number;    // 0..5
  contact: string;   // Persona de contacto
  category: string;  // rubro
  status: "Activo" | "Inactivo";
};

/** ====== Datos realistas (30 ítems) ====== */
const MOCK: Row[] = [
  { id: 1,  name: "TechAndes S.A.S.",               nit: "900123456-7", rating: 4.6, contact: "María Fernanda Ríos", category: "Servidores",      status: "Activo"   },
  { id: 2,  name: "Redes Pacífico Ltda.",           nit: "800987321-4", rating: 4.1, contact: "Juan Pablo Cabal",   category: "Redes",           status: "Activo"   },
  { id: 3,  name: "SecureVision Colombia",          nit: "901457880-2", rating: 3.8, contact: "Sofía Valencia",      category: "Seguridad",       status: "Inactivo" },
  { id: 4,  name: "Andina Software Group",         nit: "900741258-3", rating: 4.7, contact: "Carlos Ariza",         category: "Software",        status: "Activo"   },
  { id: 5,  name: "Energía & Respaldo S.A.",        nit: "890112233-5", rating: 3.2, contact: "Daniel Castaño",      category: "Energía",         status: "Inactivo" },
  { id: 6,  name: "CloudLatam Proveedores",         nit: "901203040-1", rating: 4.4, contact: "Ana Lucía Torres",     category: "Nube",            status: "Activo"   },
  { id: 7,  name: "Cableado Estructurado del Caribe", nit:"800456789-0", rating: 3.9, contact:"Hernán Bustos",        category: "Redes",           status: "Activo"   },
  { id: 8,  name: "Almacenamiento Nevado",          nit: "901334455-6", rating: 4.3, contact: "Laura Ramírez",        category: "Almacenamiento",  status: "Activo"   },
  { id: 9,  name: "Impresiones del Norte",          nit: "830556677-8", rating: 2.9, contact: "Camilo Pérez",         category: "Periféricos",     status: "Inactivo" },
  { id:10,  name: "Conectividad Andina",            nit: "900998877-1", rating: 4.0, contact: "Daniela Hoyos",        category: "Redes",           status: "Activo"   },
  { id:11,  name: "Licencias & Suites S.A.S.",      nit: "901667788-9", rating: 4.5, contact: "Andrés Ospina",        category: "Software",        status: "Activo"   },
  { id:12,  name: "Monitores Bogotá",               nit: "860445566-0", rating: 3.6, contact: "Carolina Vélez",       category: "Periféricos",     status: "Activo"   },
  { id:13,  name: "Componentes del Café",           nit: "800223344-2", rating: 4.2, contact: "Mateo Ballesteros",    category: "Equipos",         status: "Activo"   },
  { id:14,  name: "UPS Latam Power",                nit: "901778899-4", rating: 3.4, contact: "Juliana Patiño",       category: "Energía",         status: "Inactivo" },
  { id:15,  name: "DataCenter Solutions",           nit: "900314159-2", rating: 4.8, contact: "Felipe Moncada",       category: "Servidores",      status: "Activo"   },
  { id:16,  name: "Periféricos del Valle",          nit: "890778899-5", rating: 3.7, contact: "Valeria Ocampo",       category: "Periféricos",     status: "Activo"   },
  { id:17,  name: "RedNube Integradores",           nit: "901909182-6", rating: 4.1, contact: "Luis Eduardo Mora",    category: "Nube",            status: "Activo"   },
  { id:18,  name: "Seguridad Digital Andes",        nit: "901515151-3", rating: 3.1, contact: "Natalia Pineda",       category: "Seguridad",       status: "Inactivo" },
  { id:19,  name: "SSD & Storage Pro",              nit: "860909090-7", rating: 4.6, contact: "Óscar Restrepo",       category: "Almacenamiento",  status: "Activo"   },
  { id:20,  name: "OfficeCloud Licenciamiento",     nit: "901121212-9", rating: 4.0, contact: "Camila Bernal",        category: "Software",        status: "Activo"   },
  { id:21,  name: "Andes Rack & Switch",            nit: "900135791-1", rating: 3.5, contact: "Juanita Gómez",        category: "Redes",           status: "Activo"   },
  { id:22,  name: "Atlántico IT Services",          nit: "901246810-2", rating: 4.3, contact: "Miguel Ángel Rincón",  category: "Servidores",      status: "Activo"   },
  { id:23,  name: "EcoPower Respaldo",              nit: "900753951-4", rating: 2.8, contact: "Esteban Salazar",      category: "Energía",         status: "Inactivo" },
  { id:24,  name: "Cables & Fibras del Sur",        nit: "800369258-6", rating: 3.9, contact: "Paula Cruz",           category: "Redes",           status: "Activo"   },
  { id:25,  name: "ComputeMax Distribuciones",      nit: "901468024-3", rating: 4.4, contact: "Andrés Felipe Rueda",  category: "Equipos",         status: "Activo"   },
  { id:26,  name: "Print&Scan Solutions",           nit: "900642864-0", rating: 3.0, contact: "Diana Quintero",       category: "Periféricos",     status: "Inactivo" },
  { id:27,  name: "Backup Andes Cloud",             nit: "901852741-5", rating: 4.7, contact: "Tomás Cárdenas",       category: "Nube",            status: "Activo"   },
  { id:28,  name: "Guardian CCTV",                  nit: "901333222-1", rating: 3.3, contact: "Silvia Herrera",       category: "Seguridad",       status: "Inactivo" },
  { id:29,  name: "HDD Andino Mayorista",           nit: "890321654-3", rating: 3.8, contact: "Ricardo Téllez",       category: "Almacenamiento",  status: "Activo"   },
  { id:30,  name: "VirtualApps Licenses",           nit: "901707070-0", rating: 4.2, contact: "Mariana Cifuentes",    category: "Software",        status: "Activo"   },
];

/** ====== Iconos (SVG minimal) ====== */
const PlusIcon  = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="2" d="M12 5v14M5 12h14"/></svg>);
const SearchIcon= (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>);
const EyeIcon   = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/></svg>);
const PenIcon   = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path d="M12 20h9"/><path d="M16.5 3.5l4 4L7 21l-4 1 1-4L16.5 3.5z"/></svg>);
const TrashIcon = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>);

export default function SuppliersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return MOCK;
    return MOCK.filter(
      r =>
        r.name.toLowerCase().includes(term) ||
        r.contact.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term) ||
        r.nit.toLowerCase().includes(term)
    );
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goTo = (p: number) => setPage(Math.min(Math.max(p, 1), totalPages));

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (color exacto pedido) */}
      <aside className="w-64 h-screen text-white flex-shrink-0" style={{ backgroundColor: "#B20000" }}>
        <div className="px-4 py-6 font-semibold">
          Dashboard <br /> Administrador
        </div>
        <nav className="text-sm divide-y divide-white/10">
          {["Dashboard","Acceso","Productos","Servicios","Clientes","Configuración"].map((item, i) => (
            <div key={i} className="px-4 py-3 hover:bg-white/10 cursor-pointer">
              {item}
            </div>
          ))}
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 flex flex-col bg-gray-100">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
          <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
            <h1 className="text-3xl font-extrabold tracking-tight text-red-700">Proveedores</h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>Joao Estid Ortiz Cuello</span>
              <div className="h-8 w-8 rounded-full bg-gray-200" />
            </div>
          </div>
        </header>

        {/* Tools + Tabla */}
        <div className="flex-1 px-6 py-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="relative w-full max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Buscar proveedor, contacto, categoría o NIT…"
                className="w-full rounded-full border bg-white px-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <button className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700">
              <PlusIcon className="h-4 w-4" />
              Crear Proveedor
            </button>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm border flex flex-col">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10">
                <tr className="text-left">
                  <Th>Id</Th>
                  <Th>Nombre</Th>
                  <Th>NIT</Th>
                  <Th>Calificación</Th>
                  <Th>Contacto</Th>
                  <Th>Categoría</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {current.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <Td>{r.id}</Td>
                    <Td className="font-medium text-gray-900">{r.name}</Td>
                    <Td>{r.nit}</Td>
                    <Td>
                      <span className="mr-1">{stars(r.rating)}</span>
                      <span className="text-xs text-gray-500">({r.rating.toFixed(1)})</span>
                    </Td>
                    <Td>{r.contact}</Td>
                    <Td>{r.category}</Td>
                    <Td>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === "Activo" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                      }`}>
                        {r.status}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-3 text-gray-600">
                        <button className="hover:text-gray-900" title="Ver"><EyeIcon className="h-4 w-4" /></button>
                        <button className="hover:text-gray-900" title="Editar"><PenIcon className="h-4 w-4" /></button>
                        <button className="hover:text-red-600"  title="Eliminar"><TrashIcon className="h-4 w-4" /></button>
                      </div>
                    </Td>
                  </tr>
                ))}

                {current.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-500">Sin resultados.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="border-t bg-white px-3 py-2">
              <div className="flex items-center justify-center gap-1">
                <PageBtn onClick={() => goTo(page - 1)} disabled={page === 1}>{"<"}</PageBtn>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  const active = p === page;
                  return (
                    <PageBtn key={p} onClick={() => goTo(p)} active={active} aria-current={active ? "page" : undefined}>
                      {p}
                    </PageBtn>
                  );
                })}
                <PageBtn onClick={() => goTo(page + 1)} disabled={page === totalPages}>{">"}</PageBtn>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/** ====== Helpers UI ====== */
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
function stars(rating: number) {
  const n = Math.round(rating);
  return "★".repeat(n).padEnd(5, "☆");
}
function PageBtn({
  children, onClick, disabled, active, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...rest}
      onClick={onClick}
      disabled={disabled}
      className={`min-w-8 rounded-md px-2 py-1 text-xs ${
        active ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
      } border disabled:opacity-40 disabled:pointer-events-none`}
    >
      {children}
    </button>
  );
}