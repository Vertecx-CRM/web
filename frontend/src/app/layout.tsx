import "@/app/globals.css";
import { AuthProvider } from "@/features/auth/authcontext";
import { LoaderProvider } from "@/shared/components/loader"; // 👈 lo jalas de ahí mismo

export const metadata = {
  title: "Vertecx",
  description: "Dashboard Vertecx",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <LoaderProvider>{children}</LoaderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
