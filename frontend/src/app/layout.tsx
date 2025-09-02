import "@/app/globals.css";
import { AuthProvider } from "@/features/auth/authcontext";



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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
