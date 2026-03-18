"use client";

import React from "react";
import Image from "next/image";
import {
  Target,
  Eye,
  Flag,
  ShieldCheck,
  Laptop,
  Users,
  Zap,
} from "lucide-react";
import Container from "@/features/landing/about/components/Container";
import Card from "@/features/landing/about/components/Card";
import Nav from "../layout/Nav";
import Footer from "../layout/Footer";
import Accordion from "./components/Accordion";

const faqItems = [
  {
    question: "¿Qué tipo de soporte técnico ofrecen?",
    answer:
      "Brindamos soporte integral en SistemaPC: desde mantenimiento preventivo y correctivo hasta optimización avanzada de hardware y redes para empresas.",
  },
  {
    question: "¿Cómo funciona el sistema de entrega de credenciales?",
    answer:
      "Implementamos un protocolo de seguridad mediante el cual las credenciales se generan y entregan de forma encriptada, asegurando que solo el cliente final tenga acceso a sus datos técnicos.",
  },
  {
    question: "¿Tienen planes de mantenimiento corporativo?",
    answer:
      "Sí, diseñamos planes a medida bajo el modelo de Tech Solutions, con tiempos de respuesta prioritarios y soporte preventivo mensual para evitar caídas de sistema.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Hero Section - Usando el Rojo #B20000 */}
      <section className="bg-[#B20000] text-white relative overflow-hidden">
        {/* Decoración de fondo para que no sea un bloque plano */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-black/10 -skew-x-12 transform translate-x-1/2"></div>

        <div className="relative z-10 py-20 lg:py-28">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm font-semibold backdrop-blur-md">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Soluciones Tecnológicas Reales</span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none">
                  SISTEMA<span className="text-red-200">PC</span>
                </h1>
                <p className="text-xl md:text-2xl leading-relaxed text-red-50/90 max-w-xl font-light">
                  Más que soporte técnico, somos tu aliado en la era digital. En
                  **Tech Solutions** transformamos problemas complejos en
                  sistemas eficientes.
                </p>
                <div className="flex gap-4">
                  <button className="px-8 py-4 bg-white text-[#B20000] font-bold rounded-xl hover:bg-red-50 transition-all shadow-lg">
                    Ver Servicios
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-3xl"></div>
                <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
                  <Image
                    src="/assets/imgs/about-main.png"
                    alt="Infraestructura Tecnológica"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-12 fill-white"
          >
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V46.29C80.7,52.57,177.51,58.52,257.7,60.73,280,61.27,301.14,59.94,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* Pilares con acento en el rojo del proyecto */}
      <section className="py-24 bg-white">
        <Container>
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-[#B20000] font-bold uppercase tracking-widest text-sm mb-3">
                Nuestra Esencia
              </h2>
              <p className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                Comprometidos con la excelencia técnica.
              </p>
            </div>
            <div className="h-1 w-24 bg-[#B20000] mb-4 hidden md:block"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card
              variant="pillar"
              className="group hover:bg-[#B20000] transition-all duration-500 border-slate-100"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                <Eye className="w-8 h-8 text-[#B20000] group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-white">
                VISIÓN
              </h3>
              <p className="text-slate-600 group-hover:text-red-50 leading-relaxed">
                Ser el referente regional en soporte IT, destacando por nuestra
                rapidez y el uso de herramientas de última generación.
              </p>
            </Card>

            <Card
              variant="pillar"
              className="group hover:bg-[#B20000] transition-all duration-500 border-slate-100"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                <Target className="w-8 h-8 text-[#B20000] group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-white">
                MISIÓN
              </h3>
              <p className="text-slate-600 group-hover:text-red-50 leading-relaxed">
                Resolver cada incidencia técnica con precisión, garantizando que
                la tecnología sea una herramienta de crecimiento y no un
                obstáculo.
              </p>
            </Card>

            <Card
              variant="pillar"
              className="group hover:bg-[#B20000] transition-all duration-500 border-slate-100"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                <ShieldCheck className="w-8 h-8 text-[#B20000] group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-white">
                VALORES
              </h3>
              <p className="text-slate-600 group-hover:text-red-50 leading-relaxed">
                Honestidad en el diagnóstico, seguridad en el manejo de datos y
                una pasión innegociable por la informática.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* FAQ Section - Clean & Professional */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                Resolviendo tus dudas
              </h2>
              <p className="text-slate-500 text-lg font-light">
                Todo lo que necesitas saber sobre SistemaPC
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-4 md:p-8 border border-slate-200">
              <Accordion items={faqItems} />
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
