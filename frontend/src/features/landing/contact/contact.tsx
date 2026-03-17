"use client";

import React from "react";
import { Mail, MapPin, Phone, MessageSquare, clock } from "lucide-react";
import Container from "@/features/landing/contact/components/container";
import SectionTitle from "@/features/landing/contact/components/SectionTitle";
import Card from "@/features/landing/contact/components/Card";
import ContactMethod from "@/features/landing/contact/components/ContactMethod";
import ContactForm from "@/features/landing/contact/components/ContactForm";
import Nav from "../layout/Nav";
import Footer from "../layout/Footer";

interface ContactProps {
  className?: string;
}

export default function Contact({ className = "" }: ContactProps) {
  return (
    <div className={`${className} min-h-screen bg-white`}>
      <Nav />

      {/* Hero / Header Section - Enfoque Directo */}
      <section className="pt-20 pb-12 bg-slate-50 border-b border-slate-100">
        <Container>
          <div className="max-w-3xl">
            <h2 className="text-[#B20000] font-extrabold uppercase tracking-tighter text-sm mb-4 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[#B20000]"></span>
              Contacto Directo
            </h2>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
              ¿Problemas técnicos? <br />
              <span className="text-[#B20000]">Estamos listos.</span>
            </h1>
            <p className="text-xl text-slate-600 font-light leading-relaxed">
              En SistemaPC resolvemos tus dudas en tiempo récord. Elige el canal
              que prefieras y nuestro equipo de soporte te atenderá.
            </p>
          </div>
        </Container>
      </section>

      {/* Contact Methods Section */}
      <section className="py-16 relative -mt-10 z-20">
        <Container>
          <div className="grid md:grid-cols-3 gap-6">
            <Card
              variant="elevated"
              className="group p-8 bg-white border-b-4 border-transparent hover:border-[#B20000] transition-all duration-300 shadow-xl shadow-slate-200/60"
            >
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-[#B20000]" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                Correo Electrónico
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                Para consultas técnicas y presupuestos detallados.
              </p>
              <a
                href="mailto:soporte@sistemapc.com"
                className="text-[#B20000] font-bold hover:underline"
              >
                soporte@sistemapc.com
              </a>
            </Card>

            <Card
              variant="elevated"
              className="group p-8 bg-white border-b-4 border-transparent hover:border-[#B20000] transition-all duration-300 shadow-xl shadow-slate-200/60"
            >
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-[#B20000]" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                Punto Físico
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                Visítanos para diagnósticos presenciales y entregas.
              </p>
              <span className="text-[#B20000] font-bold">Monterrey, N.L.</span>
            </Card>

            <Card
              variant="elevated"
              className="group p-8 bg-white border-b-4 border-transparent hover:border-[#B20000] transition-all duration-300 shadow-xl shadow-slate-200/60"
            >
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-[#B20000]" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                Línea Directa
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                Soporte técnico inmediato vía telefónica o WhatsApp.
              </p>
              <a
                href="tel:+573136850968"
                className="text-[#B20000] font-bold hover:underline"
              >
                +57 313 685 09 68
              </a>
            </Card>
          </div>
        </Container>
      </section>

      {/* Form Section - El Rojo #B20000 como protagonista */}
      <section className="py-24 bg-[#B20000] relative overflow-hidden">
        {/* Decoración geométrica tech */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <svg
            width="100%"
            height="100%"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-100 100L500 -100M0 200L600 0"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>

        <Container>
          <div className="grid lg:grid-cols-5 gap-16 items-center">
            <div className="lg:col-span-2 text-white space-y-8">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                ¿Prefieres que te <br />
                <span className="text-red-200">escribamos nosotros?</span>
              </h2>
              <p className="text-red-50 text-lg font-light leading-relaxed">
                Completa el formulario y un técnico especializado analizará tu
                caso. Recibirás una respuesta en menos de 2 horas hábiles.
              </p>

              <div className="space-y-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-white">
                    Chat en vivo disponible
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-2">
                <div className="p-8 md:p-10">
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      Enviar Mensaje
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Todos los campos son obligatorios para procesar tu
                      solicitud.
                    </p>
                  </div>
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
