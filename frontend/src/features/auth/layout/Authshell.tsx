import type { ReactNode } from "react";

type AuthShellProps = {
  mode: "login" | "register";
  children: ReactNode;
};

export default function AuthShell({ mode, children }: AuthShellProps) {
  const panelTitle = mode === "login" ? "Acceso" : "Registro";

  return (
    <main className="min-h-screen bg-[#f8f8f8] px-4 py-10 text-black md:px-8">
      <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg">
        <header className="border-b border-black/10 bg-black px-6 py-4">
          <h1 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            {panelTitle} de Usuario
          </h1>
        </header>
        <div>{children}</div>
      </section>
    </main>
  );
}
