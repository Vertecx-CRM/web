import type { Metadata } from 'next';
import Image from 'next/image';
import { Target, Eye, Flag } from 'lucide-react';
import Container from '@/features/landing/about/components/Container';
import SectionTitle from '@/features/landing/about/components/SectionTitle';
import Card from '@/features/landing/about/components/Card';
import Accordion from '@/features/landing/about/components/Accordion';
import { JSX } from 'react';
import Nav from '../layout/Nav';

/**
 * Interface para definir la estructura de cada item del FAQ
 * Garantiza que cada pregunta tenga los campos obligatorios
 */
interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Interface para el schema de datos estructurados de Schema.org
 * Ayuda al SEO y permite a los motores de búsqueda entender mejor la organización
 */
interface OrganizationSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo: string;
  sameAs: string[];
  contactPoint: {
    "@type": string;
    telephone: string;
    contactType: string;
    email: string;
    areaServed: string;
    availableLanguage: string[];
  };
}

/**
 * Metadata tipada para Next.js - mejora el SEO de la página
 * Next.js usa esta información para generar las meta tags automáticamente
 */
export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: 'Conoce más sobre Tu Empresa, nuestra misión, visión y valores que nos guían para ofrecer las mejores soluciones.',
};

/**
 * Array de preguntas frecuentes con tipado estricto
 * Cada item debe cumplir con la interface FAQItem
 */
const faqItems: FAQItem[] = [
  {
    question: "¿Cuál es su horario de atención al cliente?",
    answer: "Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM, y sábados de 9:00 AM a 2:00 PM. También puedes contactarnos por email en cualquier momento."
  },
  {
    question: "¿Cómo solicitar una cotización?",
    answer: "Puedes solicitar una cotización a través de nuestro formulario de contacto, por teléfono o por email. Te responderemos en un máximo de 24 horas con una propuesta personalizada."
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos transferencias bancarias, tarjetas de crédito y débito, PayPal, y pagos en efectivo. También ofrecemos planes de financiamiento para proyectos grandes."
  },
  {
    question: "¿Ofrecen garantía en sus servicios?",
    answer: "Sí, todos nuestros servicios incluyen garantía. El período varía según el tipo de servicio, pero generalmente ofrecemos entre 6 meses a 2 años de garantía."
  },
  {
    question: "¿Trabajan con empresas de todos los tamaños?",
    answer: "Absolutamente. Trabajamos desde emprendedores y pequeñas empresas hasta grandes corporaciones. Adaptamos nuestras soluciones a las necesidades específicas de cada cliente."
  }
];

/**
 * Datos estructurados para SEO (Schema.org)
 * Los motores de búsqueda usan esta información para mostrar rich snippets
 * y entender mejor el contexto de la empresa
 */
const organizationSchema: OrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Tu Empresa",
  "url": "https://tuempresa.com",
  "logo": "https://tuempresa.com/logo.png",
  "sameAs": [
    "https://facebook.com/tuempresa",
    "https://instagram.com/tuempresa"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+52-55-1234-5678",
    "contactType": "customer service",
    "email": "soporte@empresa.com",
    "areaServed": "MX",
    "availableLanguage": ["Spanish"]
  }
};

/**
 * Componente principal de la página "Sobre Nosotros"
 * 
 * Estructura de la página:
 * 1. JSON-LD Schema para SEO
 * 2. Hero Section con información principal y imagen
 * 3. Sección de pilares (Visión, Misión, Objetivo)
 * 4. Estadísticas de la empresa
 * 5. Sección de preguntas frecuentes
 * 
 * @returns JSX.Element - La página completa renderizada
 */
export default function About(): JSX.Element {
  return (
    <>
    <Nav />
      {/* 
        JSON-LD Schema para SEO
        dangerouslySetInnerHTML permite insertar HTML/JSON sin escapar
        Los motores de búsqueda leen este script para entender la estructura de datos
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />

      {/* 
        Hero Section - Sección principal con fondo rojo y onda decorativa
        - bg-rojo-primario: Color personalizado definido en Tailwind config
        - wave-bottom: Clase personalizada para el efecto de onda
        - section: Clase personalizada para padding y margin estándar
      */}
      <section className="bg-rojo-primario text-white wave-bottom section">
        <Container>
          {/* 
            Grid responsivo: 1 columna en móvil, 2 columnas en pantallas grandes
            gap-12: Espacio entre columnas
            items-center: Alineación vertical centrada
          */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Columna de texto */}
            <div>
              {/* 
                Título principal con tipografía responsiva:
                - text-4xl en móvil (36px)
                - text-5xl en tablet+ (48px)
                - font-bold: Peso de fuente grueso
                - mb-6: Margen inferior de 1.5rem
              */}
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Sobre Nosotros
              </h1>
              {/* 
                Párrafo descriptivo con estilizado específico:
                - text-xl/2xl: Tamaño de texto responsivo
                - leading-relaxed: Interlineado más amplio para mejor legibilidad
                - text-red-100: Color rojo muy claro para contraste suave
              */}
              <p className="text-xl md:text-2xl leading-relaxed text-red-100">
                Somos una empresa comprometida con la excelencia, la innovación y el crecimiento de nuestros clientes. Con más de una década de experiencia, hemos ayudado a cientos de empresas a alcanzar sus objetivos.
              </p>
            </div>
            
            {/* Columna de imagen */}
            <div className="flex justify-center">
              {/* 
                Contenedor de imagen con efectos visuales:
                - relative: Necesario para el componente Image de Next.js
                - w-80 h-80: Dimensiones fijas de 320x320px
                - bg-white/10: Fondo blanco con 10% de opacidad
                - rounded-2xl: Bordes muy redondeados
                - overflow-hidden: Oculta contenido que sobresale del contenedor
              */}
              <div className="relative w-80 h-80 bg-white/10 rounded-2xl overflow-hidden">
                {/* 
                  Componente Image optimizado de Next.js:
                  - src: URL de la imagen desde Pexels
                  - alt: Texto alternativo para accesibilidad y SEO
                  - fill: Hace que la imagen llene todo el contenedor padre
                  - object-cover: Mantiene proporción y cubre todo el espacio
                  - rounded-2xl: Mantiene los bordes redondeados
                */}
                <Image
                  src="/assets/imgs/about.png"
                  alt="Equipo de trabajo colaborando"
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 
        Sección de Pilares de la empresa
        - section: Clase personalizada para espaciado estándar
        - Contiene 3 cards con Visión, Misión y Objetivo
      */}
      <section className="section">
        <Container>
          {/* 
            Componente personalizado SectionTitle
            Maneja el título y subtítulo de la sección de forma consistente
          */}
          <SectionTitle 
            title="Nuestros Pilares"
            subtitle="Los valores que nos guían en cada proyecto y decisión"
          />
          
          {/* 
            Grid de 3 columnas para los pilares:
            - grid: Activa CSS Grid
            - md:grid-cols-3: 3 columnas en tablet+, 1 columna en móvil por defecto
            - gap-8: Espacio de 2rem entre items
            - mt-12: Margen superior de 3rem
          */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            
            {/* Card de Visión */}
            <Card variant="elevated" className="text-center">
              {/* 
                Contenedor circular para el icono:
                - w-16 h-16: Dimensiones de 64x64px
                - bg-rojo-primario/10: Fondo rojo con 10% opacidad
                - rounded-full: Hace el contenedor circular
                - flex items-center justify-center: Centra el icono
                - mx-auto: Centra horizontalmente el contenedor
                - mb-6: Margen inferior de 1.5rem
              */}
              <div className="w-16 h-16 bg-rojo-primario/10 rounded-full flex items-center justify-center mx-auto mb-6">
                {/* 
                  Icono de ojo de Lucide React:
                  - w-8 h-8: Tamaño de 32x32px
                  - text-rojo-primario: Color rojo personalizado
                */}
                <Eye className="w-8 h-8 text-rojo-primario" />
              </div>
              {/* Título del pilar */}
              <h3 className="text-2xl font-semibold mb-4">Visión</h3>
              {/* 
                Descripción del pilar:
                - text-muted: Clase personalizada para texto secundario
                - leading-relaxed: Interlineado amplio para mejor legibilidad
              */}
              <p className="text-muted leading-relaxed">
                Ser la empresa líder en nuestro sector, reconocida por la calidad 
                de nuestros servicios y el impacto positivo en la comunidad empresarial.
              </p>
            </Card>

            {/* Card de Misión - Estructura similar a Visión */}
            <Card variant="elevated" className="text-center">
              <div className="w-16 h-16 bg-rojo-primario/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-rojo-primario" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Misión</h3>
              <p className="text-muted leading-relaxed">
                Proporcionar soluciones innovadoras y personalizadas que impulsen 
                el crecimiento y éxito de nuestros clientes, superando sus expectativas.
              </p>
            </Card>

            {/* Card de Objetivo - Estructura similar a Visión */}
            <Card variant="elevated" className="text-center">
              <div className="w-16 h-16 bg-rojo-primario/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Flag className="w-8 h-8 text-rojo-primario" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Objetivo</h3>
              <p className="text-muted leading-relaxed">
                Mantener la excelencia en cada proyecto, construir relaciones duraderas 
                y contribuir al desarrollo sostenible del sector empresarial.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* 
        Sección de estadísticas de la empresa
        - section: Espaciado estándar
        - bg-gris-claro: Fondo gris claro personalizado
      */}
      <section className="section bg-gris-claro">
        <Container>
          {/* 
            Grid responsivo para estadísticas:
            - grid-cols-2: 2 columnas en móvil
            - md:grid-cols-4: 4 columnas en tablet+
            - gap-8: Espacio entre items
            - text-center: Texto centrado
          */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            {/* Estadística: Años de experiencia */}
            <div>
              {/* 
                Número destacado:
                - text-4xl: Tamaño grande (36px)
                - font-bold: Peso grueso
                - text-rojo-primario: Color rojo personalizado
                - mb-2: Margen inferior pequeño
              */}
              <div className="text-4xl font-bold text-rojo-primario mb-2">10+</div>
              {/* 
                Descripción de la estadística:
                - text-muted: Color de texto secundario personalizado
              */}
              <div className="text-muted">Años de experiencia</div>
            </div>
            
            {/* Estadística: Clientes satisfechos */}
            <div>
              <div className="text-4xl font-bold text-rojo-primario mb-2">500+</div>
              <div className="text-muted">Clientes satisfechos</div>
            </div>
            
            {/* Estadística: Proyectos completados */}
            <div>
              <div className="text-4xl font-bold text-rojo-primario mb-2">1000+</div>
              <div className="text-muted">Proyectos completados</div>
            </div>
            
            {/* Estadística: Profesionales */}
            <div>
              <div className="text-4xl font-bold text-rojo-primario mb-2">50+</div>
              <div className="text-muted">Profesionales</div>
            </div>
          </div>
        </Container>
      </section>

      {/* 
        Sección de Preguntas Frecuentes (FAQ)
        - section: Espaciado estándar
      */}
      <section className="section">
        <Container>
          {/* Título de la sección FAQ */}
          <SectionTitle 
            title="Preguntas Frecuentes"
            subtitle="Encuentra respuestas a las consultas más comunes"
          />
          
          {/* 
            Contenedor centrado para el acordeón:
            - max-w-4xl: Ancho máximo de 896px
            - mx-auto: Centrado horizontal
            - mt-12: Margen superior de 3rem
          */}
          <div className="max-w-4xl mx-auto mt-12">
            {/* 
              Componente Accordion personalizado:
              - Recibe el array faqItems como prop
              - items tiene tipo FAQItem[] gracias al tipado TSX
              - El componente maneja internamente el estado de apertura/cierre
            */}
            <Accordion items={faqItems} />
          </div>
        </Container>
      </section>
    </>
  );
};
