"use client";

import Link from "next/link";
import { ArrowRight, SearchCheck } from "lucide-react";
import { seoServicePages } from "../seo/servicePages";

export default function SeoServiceLinks() {
  return (
    <section className="bg-black px-6 py-20 text-white sm:px-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <SearchCheck className="h-5 w-5 text-red-500" aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
                Encuentranos en Google
              </span>
            </div>
            <h2 className="text-4xl font-black uppercase leading-none tracking-tight md:text-6xl">
              Soluciones que tus clientes ya estan buscando.
            </h2>
          </div>
          <p className="text-base leading-7 text-gray-300">
            Creamos paginas especificas para servicios con busquedas reales:
            soporte tecnico empresarial, mantenimiento de computadores, redes y
            servidores. Cada una apunta a una necesidad clara y conecta directo
            con contacto.
          </p>
        </div>

        <div className="grid gap-0 border border-white/10 md:grid-cols-3">
          {seoServicePages.map((page, index) => (
            <Link
              key={page.slug}
              href={`/landing/soluciones/${page.slug}`}
              className="group min-h-[260px] border-b border-white/10 p-8 transition hover:bg-white hover:text-black md:border-b-0 md:border-r md:last:border-r-0"
            >
              <span className="text-6xl font-black text-white/10 transition group-hover:text-red-100">
                0{index + 1}
              </span>
              <p className="mt-8 text-xs font-black uppercase tracking-[0.25em] text-red-500">
                {page.eyebrow}
              </p>
              <h3 className="mt-3 text-xl font-black uppercase leading-tight">
                {page.title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-gray-400 transition group-hover:text-gray-700">
                {page.summary}
              </p>
              <span className="mt-7 inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-red-500">
                Ver solucion
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
