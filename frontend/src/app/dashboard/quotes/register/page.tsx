"use client";

import RequireAuth from "@/features/auth/requireauth";
import RegisterQuoteForm from "@/features/dashboard/quotes/components/RegisterQuote";
import { createQuote } from "@/features/dashboard/quotes/api/quotes.api";
import { useRouter } from "next/navigation";

export default function QuotesRegisterPage() {
  const router = useRouter();

  return (
    <RequireAuth>
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Crear Cotizacion</h1>

          <button
            type="button"
            onClick={() => router.back()}
            className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Volver
          </button>
        </div>

        <RegisterQuoteForm
          onSave={async (payload) => {
            await createQuote(payload);
            router.push("/dashboard/quotes");
          }}
        />
      </div>
    </RequireAuth>
  );
}
