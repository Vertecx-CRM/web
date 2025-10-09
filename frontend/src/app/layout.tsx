import "@/app/globals.css";
import { AuthProvider } from "@/features/auth/authcontext";
import { CartProvider } from "@/features/landing/contexts/CartContext";
import { LoaderProvider } from "@/shared/components/loader";
import { ToastContainer } from "react-toastify";

export const metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Vertecx",
  description: "Dashboard Vertecx",
  openGraph: {
    images: ["/assets/imgs/preview.png"],
  },
  twitter: {
    images: ["/assets/imgs/preview.png"],
  },
  icons: {
    icon: "/assets/imgs/preview.png",
    shortcut: "/assets/imgs/favicon.ico",
    apple: "/assets/imgs/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ToastContainer position="bottom-right" />

        <AuthProvider>
          <LoaderProvider>
            <CartProvider>{children}</CartProvider>
          </LoaderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
