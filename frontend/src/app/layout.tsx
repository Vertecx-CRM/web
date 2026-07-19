import '@/app/globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  BRAND_KEYWORDS,
  SITE_NAME,
  getSiteUrl,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo';
import AppProviders from './providers';
import FloatingWhatsAppButton from '@/features/landing/components/FloatingWhatsAppButton';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME,
  title: {
    default: 'Vertecx | Soporte tecnico empresarial en Colombia',
    template: '%s | Vertecx',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: BRAND_KEYWORDS,
  authors: [{ name: 'Vertecx Sistemas PC' }],
  creator: 'Vertecx',
  publisher: 'Vertecx Sistemas PC',
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Vertecx | Soporte tecnico empresarial en Colombia',
    description: DEFAULT_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    locale: 'es_CO',
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1024,
        height: 1024,
        alt: 'Vertecx - soluciones tecnologicas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vertecx | Soporte tecnico empresarial en Colombia',
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: '/assets/imgs/logo.png',
    shortcut: '/assets/imgs/logo.png',
    apple: '/assets/imgs/logo.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const businessSchema = organizationJsonLd();
  const websiteSchema = websiteJsonLd();
  const adsenseClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;

  return (
    <html lang="es">
      <body>
        {adsenseClient ? (
          <Script
            id="google-adsense"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(businessSchema).replace(/</g, '\\u003c'),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema).replace(/</g, '\\u003c'),
          }}
        />
        <AppProviders>
          {children}
          <FloatingWhatsAppButton />
        </AppProviders>
      </body>
    </html>
  );
}
