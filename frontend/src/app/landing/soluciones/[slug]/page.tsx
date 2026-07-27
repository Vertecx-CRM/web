import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, MapPin, Phone } from "lucide-react";
import Layout from "@/features/landing/layout/Layout";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  getSeoServicePage,
  seoServicePages,
  serviceJsonLd,
} from "@/features/landing/seo/servicePages";
import { createPageMetadata } from "@/lib/seo";
import { routes } from "@/shared/routes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return seoServicePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = getSeoServicePage(slug);

  if (!page) return {};

  return createPageMetadata({
    title: `${page.title} - Vertecx Sistemas PC`,
    description: page.description,
    path: `/landing/soluciones/${page.slug}`,
  });
}

export default async function SeoServicePage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSeoServicePage(slug);

  if (!page) notFound();

  const schemas = [serviceJsonLd(page), faqJsonLd(page), breadcrumbJsonLd(page)];

  return (
    <Layout>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      ))}

      <section className="bg-white px-6 py-24 text-black sm:px-10 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.75fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-red-600">
              {page.eyebrow}
            </p>
            <h1 className="mt-5 text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
              {page.heroTitle}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-600">
              {page.summary}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href={routes.landing.contact}
                className="inline-flex items-center justify-center gap-3 bg-red-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-black"
              >
                Solicitar diagnostico
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="https://wa.me/573136850968"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 border border-black px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition hover:bg-black hover:text-white"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>

          <aside className="border-t-4 border-red-600 bg-black p-8 text-white">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-400">
              Palabras clave
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {page.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-200"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <div className="mt-8 border-t border-white/10 pt-8">
              <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-red-400">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Cobertura
              </p>
              <p className="text-sm leading-7 text-gray-300">
                {page.cities.join(" - ")}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-20 text-black sm:px-10 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">
              Que incluye
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase leading-tight">
              Servicio tecnico pensado para empresas que no pueden detenerse.
            </h2>
            <div className="mt-10 grid gap-4">
              {page.services.map((service) => (
                <div key={service} className="flex gap-4 border-b border-gray-200 pb-4">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-red-600" />
                  <p className="text-sm leading-7 text-gray-700">{service}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">
              Ideal para
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {page.industries.map((industry) => (
                <div key={industry} className="bg-white p-6 shadow-sm">
                  <p className="text-sm font-black uppercase leading-6 text-black">
                    {industry}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-white p-8">
              <h2 className="text-2xl font-black uppercase">Preguntas frecuentes</h2>
              <div className="mt-6 space-y-6">
                {page.faqs.map((faq) => (
                  <div key={faq.question} className="border-t border-gray-100 pt-5">
                    <h3 className="font-black text-black">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-7 text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
